# ##### BEGIN GPL LICENSE BLOCK #####
#
#  This program is free software; you can redistribute it and/or
#  modify it under the terms of the GNU General Public License
#  as published by the Free Software Foundation; either version 2
#  of the License, or (at your option) any later version.
#
#  This program is distributed in the hope that it will be useful,
#  but WITHOUT ANY WARRANTY; without even the implied warranty of
#  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#  GNU General Public License for more details.
#
#  You should have received a copy of the GNU General Public License
#  along with this program; if not, write to the Free Software Foundation,
#  Inc., 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301, USA.
#
# ##### END GPL LICENSE BLOCK #####

# <pep8-80 compliant>

bl_info = {
    "name": "Golfcraft format",
    "author": "Golfcraft; Eibriel, Prashant, carlosmu",
    "version": (0, 0, 8),
    "blender": (2, 93, 0),
    "location": "3D view sidebar",
    "description": "Export parts and levels for Golfcraft",
    "warning": "",
    # "doc_url": "{BLENDER_MANUAL_URL}/addons/import_export/scene_obj.html",
    # "support": 'OFFICIAL',
    "category": "Import-Export",
}

from ctypes import alignment
import os
import bpy
import json
import base64
import tempfile
import random as rd
from collections import namedtuple
import requests
from bpy.types import (
    AddonPreferences
)
from bpy.props import (
    BoolProperty,
    FloatProperty,
    StringProperty,
    EnumProperty,
    PointerProperty,
    CollectionProperty,
    IntProperty
)
from bpy_extras.io_utils import (
    orientation_helper,
    path_reference_mode,
    axis_conversion,
)
from mathutils import Matrix

class ExportGolfcraftLevel(bpy.types.Operator):
    """Save a Golfcraft level JSON File"""

    bl_idname = "export_level.golfcraft"
    bl_label = 'Export Level'

    def execute(self, context):
        C = bpy.context
        D = bpy.data

        golfcraft_setup = context.scene.golfcraft_setup

        for collection in C.scene.view_layers[0].layer_collection.children:
            parts = {
                "parts": []
            }
            nid = 0
            if not collection.exclude:
                for obj in collection.collection.objects:
                    values = readValues(obj.golfcraft_properties.values)
                    part = {
                        "id": "",
                        "subtype": "",
                        "position": [],
                        "rotation": [],
                        "scale": []
                    }
                    get_pos = False
                    part["id"] = nid
                    if obj.instance_type == "COLLECTION":
                        if obj.instance_collection is not None:
                            if obj.instance_collection.name == "FX_Hole":
                                part["type"] = "hole"
                            elif obj.instance_collection.name == "FX_InitialPosition":
                                part["type"] = "initial_position"
                            elif obj.instance_collection.name == "FX_Spawn":
                                part["type"] = "spawn"
                            elif obj.instance_collection.name == "FX_Voxter":
                                part["type"] = "voxter"
                            elif obj.instance_collection.name == "FX_Checkpoint":
                                part["type"] = "checkpoint"
                                # if "order" in values:
                                #     part["order"] = int(values["order"])
                                # else:
                                #     self.report({'ERROR'}, "Make sure to set the order on Checkpoint {}".format(obj.name))
                                #     return {'CANCELLED'}
                            elif obj.instance_collection.name == "FX_LandMine":
                                part["subtype"] = "LandMine"
                                part["type"] = "explosive"
                            elif obj.instance_collection.name == "FX_Magnet":
                                part["subtype"] = "Magnet"
                                part["type"] = "magnet"
                            elif obj.instance_collection.name == "FX_Wind":
                                part["subtype"] = "Wind2"
                                part["type"] = "wind"
                            else:
                                part["subtype"] = obj.instance_collection.name
                                part["type"] = "solid"

                    # V1
                    elif obj.name.startswith("hole"):
                        get_pos = True
                        part["type"] = "hole"
                    elif obj.name.startswith("initial_position"):
                        get_pos = True
                        part["type"] = "initial_position"
                    elif obj.name.startswith("checkpoint"):
                        get_pos = True
                        part["type"] = "checkpoint"
                        part["order"] = int(obj.name.split("_")[1])
                    elif "_" in obj.name:
                        get_pos = True
                        part["type"] = obj.name.split("_")[0]

                    if obj.animation_data is not None:
                        anim = {}
                        curves = obj.animation_data.action.fcurves
                        if curves is not None:
                            for curve in curves:
                                if curve.data_path not in anim:
                                    anim[curve.data_path] = {}
                                array_index = ""
                                if curve.data_path in ["location", "scale"]:
                                    if curve.array_index == 0:
                                        array_index = "x"
                                    elif curve.array_index == 1:
                                        array_index = "z"
                                    elif curve.array_index == 2:
                                        array_index = "y"
                                elif curve.data_path == "rotation_quaternion":
                                    if curve.array_index == 0:
                                        array_index = "w"
                                    elif curve.array_index == 1:
                                        array_index = "x"
                                    elif curve.array_index == 2:
                                        array_index = "z"
                                    elif curve.array_index == 3:
                                        array_index = "y"
                                if array_index not in anim[curve.data_path]:
                                    anim[curve.data_path][array_index] = []
                                for keyframe in curve.keyframe_points:
                                    value = keyframe.co[1]
                                    if curve.data_path == "location":
                                        if array_index in ["x", "z"]:
                                            value = value * -1
                                    if curve.data_path == "rotation_quaternion":
                                        if array_index in ["x", "z", "w"]:
                                            value = value * -1
                                    anim[curve.data_path][array_index].append([keyframe.co[0], value])
                            part["animation"] = anim

                    if obj.rotation_mode != "QUATERNION":
                        if obj.animation_data is not None:
                            self.report({'ERROR'}, "Make sure to use Quaternion rotation on {}".format(obj.name))
                            return {'CANCELLED'}
                        else:
                            obj.rotation_mode = 'QUATERNION'

                    part["position"] = [
                        obj.location[0] * -1,
                        obj.location[2],
                        obj.location[1] * -1
                    ]
                    part["rotation"] = [
                        obj.rotation_quaternion[1] * -1,
                        obj.rotation_quaternion[3],
                        obj.rotation_quaternion[2] * -1,
                        obj.rotation_quaternion[0] * -1
                    ]
                    part["scale"] = [
                        obj.scale[0],
                        obj.scale[2],
                        obj.scale[1],
                    ]

                    # Add solid part if needed
                    if part["type"] == "checkpoint":
                        pass
                    # Store object expressions
                    part["expressions"] = {}
                    for expression in obj.golfcraft_properties.expression_collection:
                        striped_expression_name = expression.name.strip()
                        if striped_expression_name in part["expressions"]:
                            self.report({'ERROR'}, "{} is not an unique expression on {}".format(striped_expression_name, obj.name))
                            return {'CANCELLED'}
                        try:
                            part["expressions"][striped_expression_name] = json.loads(expression.expression)
                        except:
                            self.report({'ERROR'}, "Expression {} on {} is not valid JSON".format(striped_expression_name, obj.name))
                            return {'CANCELLED'}

                    parts["parts"].append(part)
                    nid += 1

                # Store scene expressoins
                parts["expressions"] = {}
                for expression in golfcraft_setup.expression_collection:
                    striped_expression_name = expression.name.strip()
                    if striped_expression_name in parts["expressions"]:
                        self.report({'ERROR'}, "{} is not an unique Scene expression".format(striped_expression_name))
                        return {'CANCELLED'}
                    try:
                        parts["expressions"][striped_expression_name] = json.loads(expression.expression)
                    except:
                        self.report({'ERROR'}, "Scene expression {} is not valid JSON".format(striped_expression_name))
                        return {'CANCELLED'}

                if golfcraft_setup.export_to_disk:
                    json_name = "{}.ts".format(collection.name)
                    save_path = bpy.path.abspath(os.path.join(bpy.path.native_pathsep(golfcraft_setup.export_path_course_definitions), json_name))
                    with open(save_path, 'w') as fp:
                        fp.write("export default ")
                        json.dump(parts, fp, sort_keys=True, indent=4)

                if golfcraft_setup.export_to_database:
                    course_alias = collection.name
                    definition = {
                        "address": "0x0",
                        "alias": course_alias,
                        "metadata": """{"GC":10, "xp":10, "minLevel":1}""",
                        "definition": json.dumps(parts),
                        "status": 0
                    }
                    status = sendItem(definition, context, "COURSE")
                    if status != 200:
                        self.report({'ERROR'}, "Error updating course {} on server".format(course_alias))

        return {'FINISHED'}

    def draw(self, context):
        pass


class ExportPartsColliders(bpy.types.Operator):
    """Export visible colliders"""

    bl_idname = "gc.export_colliders"
    bl_label = 'Export Colliders'

    def execute(self, context):
        C = bpy.context
        D = bpy.data
        golfcraft_setup = C.scene.golfcraft_setup
        colliders_path = golfcraft_setup.export_colliders_path

        # Export visible only
        objects = bpy.context.visible_objects

        for ob in objects:
            bpy.ops.object.select_all(action='DESELECT')
            if ob.name.endswith("_collider"):
                ob.select_set(True)

                if ob.modifiers:                    
                    error_message = f"{ob.name} has modifiers. Please apply or remove them first"
                    self.report({'ERROR'}, error_message)
                    return{'CANCELLED'}
                else:
                    pass

                collider_glb_path = os.path.abspath(bpy.path.abspath(colliders_path) + ob.name + ".glb")
                
                bpy.ops.export_scene.gltf(
                                    filepath= collider_glb_path,
                                    export_format="GLB",
                                    use_selection=True,
                                    export_apply=True,            
                                    )

        return {'FINISHED'}

class ExportPartsThumbnails(bpy.types.Operator):
    """Export highres thumbnails of all active collections"""

    bl_idname = "gc.export_thumbnails"
    bl_label = 'Export Thumbnails'

    def execute(self, context):
        C = bpy.context
        D = bpy.data
        golfcraft_setup = C.scene.golfcraft_setup

        
        original_camera = C.scene.camera
        original_use_nodes = C.scene.use_nodes
        original_render_collection_status = C.view_layer.layer_collection.children["render"].exclude
        # Get variables
        thumbnails_path = golfcraft_setup.export_thumbnails_path
        thumbnails_size = golfcraft_setup.export_thumbnails_size
        ignored_collections = golfcraft_setup.export_thumbnails_ignored_collections
        use_background = golfcraft_setup.use_compositor_background
        
        list_ignored = [i.strip() for  i in ignored_collections.split(",")]

        # Set scene params
        C.scene.render.resolution_x = thumbnails_size
        C.scene.render.resolution_y = thumbnails_size
        C.scene.render.film_transparent = True
        # C.scene.render.filepath = thumbnails_path
        C.scene.render.image_settings.file_format = "PNG"
        C.scene.render.image_settings.color_mode = "RGBA"
        C.scene.render.image_settings.color_depth = "8"
        if use_background:
            C.scene.use_nodes = True

        # Enable render collection (not excluded)
        C.view_layer.layer_collection.children["render"].exclude = False

        # Hide all collections except "Render"
        for col in D.collections:
            if col.name == "render":
                col.hide_render = False # Unhide render collection
            else:
                col.hide_render = True

        # Render each collection
        for col in D.collections:
            # if col.exclude == False:
            if col.name in list_ignored:
                pass
            else:
                if C.view_layer.layer_collection.children[col.name].exclude == False:
                    col.hide_render = False
                    for ob in C.visible_objects:
                        if ob.name.endswith("_cannon") or ob.name.endswith("_collider"):
                            ob.hide_render = True
                    for ob in D.objects:
                        if ob.type == 'CAMERA' and ob.name in col.name:
                            C.scene.camera = ob                        
                    C.scene.render.filepath = f"{thumbnails_path}{col.name}_{thumbnails_size}px"
                    bpy.ops.render.render(animation=False, write_still=True)
                    col.hide_render = True
                
        C.scene.camera = original_camera
        C.scene.use_nodes = original_use_nodes
        C.view_layer.layer_collection.children["render"].exclude = original_render_collection_status

        return {'FINISHED'}

class ExportGolfcraftPart(bpy.types.Operator):
    """Save a Golfcraft part JSON File"""

    bl_idname = "export_part.golfcraft"
    bl_label = 'Export Part'

    def execute(self, context):
        C = bpy.context
        D = bpy.data

        golfcraft_setup = context.scene.golfcraft_setup

        if not (golfcraft_setup.export_gltf or golfcraft_setup.export_to_database):
            self.report({'ERROR'}, "Nothing will be exported, turn on glTF or Database export")

        naming_errors = False
        for collection in C.scene.view_layers[0].layer_collection.children:
            if collection.exclude:
                continue
            if "-" in collection.name:
                naming_errors = True
                self.report({'ERROR'}, "Character '-' not allowed on collection name \"{}\" (please use snake_case)".format(collection.name))
            if " " in collection.name:
                naming_errors = True
                self.report({'ERROR'}, "Space character not allowed on collection name \"{}\" (please use snake_case)".format(collection.name))
            if collection.name != collection.name.lower():
                naming_errors = True
                self.report({'ERROR'}, "The name of the collection \"{}\" is not using the snake_case".format(collection.name))

        if naming_errors:
            return {'ABORTED'}
        
        properties_errors = False
        for ob in C.visible_objects:
            if ob.name.endswith("_cannon") and ob.golfcraft_properties.material == 'none':
                properties_errors = True
                self.report({'ERROR'}, "Please, assign a physical material to \"{}\"".format(ob.name))
        if properties_errors:
            return {'CANCELLED'}

        transform_errors = False
        for ob in C.visible_objects:
            if ob.type == 'MESH':
                if ob.rotation_mode == 'QUATERNION':
                    transform_errors = True
                    self.report({'ERROR'}, "Please change 'QUATERNION' rotation of \"{}\" to 'EULER_XYZ'".format(ob.name))
                else:
                    loc, rot, sca = ob.location, ob.rotation_euler, ob.scale
                    if not is_equals(rot, 0.0) or not is_equals(loc, 0.0) or not is_equals(sca, 1.0):
                        transform_errors = True
                        self.report({'ERROR'}, "Please, apply all transforms of \"{}\"".format(ob.name))                        

        if transform_errors:
            return {'CANCELLED'}

        for collection in C.scene.view_layers[0].layer_collection.children:
            cannon_objects = []
            bpy.ops.object.select_all(action='DESELECT')
            if collection.name != "render": # Avoid to export render collection
                if not collection.exclude:
                    animation = []
                    for obj in collection.collection.objects:
                        # Make all objects visible on render
                        obj.hide_render = False
                        if obj.name.endswith("_cannon"):
                            ConvexPolyhedron = {
                                "name": obj.name,
                                "verts": [],
                                "faces": [],
                                "material": obj.golfcraft_properties.material
                            }

                            for vertice in obj.data.vertices:
                                add_noise = False
                                if add_noise:
                                    ConvexPolyhedron["verts"].append((vertice.co.x * -1) + (rd.random() * 0.1))
                                    ConvexPolyhedron["verts"].append(vertice.co.z - (rd.random() * 0.1))
                                    ConvexPolyhedron["verts"].append((vertice.co.y * -1) + (rd.random() * 0.1))
                                else:
                                    ConvexPolyhedron["verts"].append(vertice.co.x * -1)
                                    ConvexPolyhedron["verts"].append(vertice.co.z)
                                    ConvexPolyhedron["verts"].append(vertice.co.y * -1)

                            for polygon in obj.data.polygons:
                                if len(polygon.vertices) > 3:
                                    self.report({'ERROR'}, "Make sure the mesh for object \"{}\" uses triangles only".format(obj.name))
                                    return {'CANCELLED'}
                                for v in polygon.vertices:
                                    ConvexPolyhedron["faces"].append(v)

                            cannon_objects.append(ConvexPolyhedron)
                        elif obj.name.endswith("_glb") or obj.name.endswith("_collider") or obj.name.endswith("_armature"):
                            obj.hide_set(False)
                            obj.select_set(True)

                    if golfcraft_setup.export_to_disk:
                        json_name = "{}.ts".format(collection.name)
                        save_path = bpy.path.abspath(os.path.join(bpy.path.native_pathsep(golfcraft_setup.export_path_cannon_definitions), json_name))
                        print(save_path)
                        with open(save_path, 'w') as fp:
                            fp.write("export default ")
                            json.dump(cannon_objects, fp, sort_keys=True, indent=4)

                    gltf_name = "{}.gltf".format(collection.name)
                    save_path = bpy.path.abspath(os.path.join(bpy.path.native_pathsep(golfcraft_setup.export_path_3dmodels), gltf_name))
                    texture_path = bpy.path.abspath(os.path.join(bpy.path.native_pathsep(golfcraft_setup.export_path_3dmodels), "textures"))
                    if golfcraft_setup.export_gltf:
                        bpy.ops.export_scene.gltf(
                            filepath=save_path,
                            # check_extisting=False,
                            export_format="GLTF_SEPARATE",
                            export_texture_dir=texture_path,
                            use_selection=True,
                            export_apply=True,
                            export_animations=golfcraft_setup.export_animations,
                            export_frame_range=True,
                            export_force_sampling=True,
                            export_nla_strips=True,
                            export_optimize_animation_size=False,
                            export_anim_single_armature=True
                            )
                    if golfcraft_setup.export_to_database:
                        # Hide Cannon and Collider for thumbnail
                        for obj in collection.collection.objects:
                            if obj.name.endswith("_cannon") or obj.name.endswith("_collider"):
                                obj.hide_render = True
                        definition = {
                            "alias": collection.name,
                            "definition": json.dumps(cannon_objects),
                            "boundingBox": json.dumps(getBoundingBox(collection.collection)),
                            "thumbnail64": getThumbnailBase64()
                        }
                        status = sendItem(definition, context, "PART")
                        if status != 200:
                            self.report({'ERROR'}, "Error sending part {} on server".format(definition["alias"]))

        return {'FINISHED'}

    def draw(self, context):
        pass

def is_equals(vector, value):
    x, y, z = vector.x, vector.y, vector.z
    return x == value and y == value and z == value

def sendItem(definition, context, itemType):
    preferences = context.preferences
    golfcraft_prefs = preferences.addons[__name__].preferences

    # Check if item exists
    if itemType == "COURSE":
        get_endpoint = "/api/get-course"
        set_endpoint = "/api/course"
    elif itemType == "PART":
        get_endpoint = "/api/get-part"
        set_endpoint = "/api/part"
    else:
        print("itemType should be COURSE or PART, not {}".format(itemType))
        return 0
    get_url = golfcraft_prefs.api_url + get_endpoint
    try:
        response = requests.post(get_url, json={"alias": definition["alias"]})
    except requests.ConnectionError as err:
        return 0
    if response.status_code not in [200, 404]:
        print("Error getting item")
        return response.status_code
    exists = response.status_code == 200

    # Get credentials
    with open(golfcraft_prefs.credentials_path, "r") as read_file:
        credentials = json.load(read_file)

    set_url = golfcraft_prefs.api_url + set_endpoint
    status_code = 0
    if exists:
        definition_json = {
            "ID": response.json()["ID"],
            "alias": definition["alias"],
            "data": {
                "definition": definition["definition"]
            }
        }
        if itemType == "PART":
            definition_json["data"]["thumbnail64"] = definition["thumbnail64"]
            definition_json["data"]["boundingBox"] = definition["boundingBox"]
        print("Item exists")
        print(definition_json)
        try:
            response = requests.put(set_url, json=definition_json, auth=requests.auth.HTTPBasicAuth(credentials["user"], credentials["password"]))
            status_code = response.status_code
        except requests.ConnectionError as err:
            print(err)
    else:
        print("New item")
        print(definition)
        try:
            response = requests.post(set_url, json=definition, auth=requests.auth.HTTPBasicAuth(credentials["user"], credentials["password"]))
            status_code = response.status_code
            print(response.content)
            print(status_code)
        except requests.ConnectionError as err:
            print(err)
    return status_code


def readValues(text):
    result = {}
    if len(text) > 2:
        kv_pairs = text.split(",")
        for pair in kv_pairs:
            kv = pair.split(":")
            if kv[0] == "":
                continue
            if len(kv) > 0:
                result[kv[0]] = ""
                if len(kv) > 1:
                    result[kv[0]] = kv[1]
    return result


def writeValues(values):
    text = ""
    for k, v in values.items():
        text += "{}:{},".format(k, v)
    # Remove last comma
    text = text[:-1]
    return text


def getBoundingBox(collection):
    max_x = 0
    max_y = 0
    max_z = 0
    min_x = 0
    min_y = 0
    min_z = 0

    for obj in collection.objects:
        if obj.type =='MESH': # Prevents errors with camera on export
            for vertice in obj.data.vertices:
                v_world = obj.matrix_world @ vertice.co

                if max_x < v_world.x:
                    max_x = v_world.x
                if max_y < v_world.y:
                    max_y = v_world.y
                if max_z < v_world.z:
                    max_z = v_world.z
                #
                if min_x > v_world.x:
                    min_x = v_world.x
                if min_y > v_world.y:
                    min_y = v_world.y
                if min_z > v_world.z:
                    min_z = v_world.z

    size_x = abs(max_x - min_x)
    size_y = abs(max_z - min_z)  # Z
    size_z = abs(max_y - min_y)  # Y

    position_x = ((max_x - size_x) * -1) - (size_x * 0.5)
    position_y = (max_z - size_y) + (size_y * 0.5)
    position_z = ((max_y - size_z) * -1) - (size_z * 0.5)

    return {
        "scale": [size_x, size_y, size_z],
        "location": [position_x, position_y, position_z],
    }


def getThumbnailBase64():
    C = bpy.context
    D = bpy.data
    layer_collection = C.view_layer.layer_collection
    tmp_file = os.path.join(tempfile.gettempdir(), "golfcraft_part_thumbnail.png")
    C.scene.render.resolution_x = 64
    C.scene.render.resolution_y = 64
    C.scene.render.film_transparent = True
    C.scene.render.filepath = tmp_file
    C.scene.render.image_settings.file_format = "PNG"
    C.scene.render.image_settings.color_mode = "RGBA"
    C.scene.render.image_settings.color_depth = "8"
    C.scene.use_nodes = False

    # Set custom camera
    original_camera = C.scene.camera # save original camera
    original_render_collection_status = C.view_layer.layer_collection.children["render"].exclude
    C.view_layer.layer_collection.children["render"].exclude = False
    # Hide all collections except "Render"
    for col in D.collections:
        if col.name == "render":
            col.hide_render = False # Unhide render collection
        else:
            col.hide_render = True

    for col in D.collections:
        if col.name == "render" or layer_collection.children[col.name].exclude == True:
            pass
        else:
            col.hide_render = False
            for ob in D.objects:
                if ob.type == 'CAMERA' and ob.name in col.name:
                    C.scene.camera = ob

            bpy.ops.render.render(animation=False, write_still=True)
            col.hide_render = True
            C.scene.camera = original_camera # recover original camera 
            C.view_layer.layer_collection.children["render"].exclude = original_render_collection_status
            with open(tmp_file, "rb") as img_file:
                return base64.b64encode(img_file.read()).decode('utf-8')


class AutofillPartValues(bpy.types.Operator):
    """Autofill part values for active object"""

    bl_idname = "autofill_values.golfcraft"
    bl_label = 'Autofill Values'

    def execute(self, context):
        C = bpy.context
        D = bpy.data
        golfcraft_properties = context.active_object.golfcraft_properties

        values = readValues(golfcraft_properties.values)

        if context.active_object.instance_collection.name == "FX_Checkpoint":
            if "order" not in values:
                values["order"] = 0

        golfcraft_properties.values = writeValues(values)

        return {'FINISHED'}

    def draw(self, context):
        pass


class AddSceneExpression(bpy.types.Operator):
    """Add a new expression to the scene"""

    bl_idname = "add_scene_expression.golfcraft"
    bl_label = 'Add Scene Expression'

    def execute(self, context):
        C = bpy.context
        D = bpy.data
        golfcraft_setup = context.scene.golfcraft_setup

        expression_collection = golfcraft_setup.expression_collection
        expression_item = expression_collection.add()
        expression_item.name = "Expression"

        golfcraft_setup.expression_collection_index = (
            len(golfcraft_setup.expression_collection) - 1
        )

        return {'FINISHED'}

    def draw(self, context):
        pass


class RemoveSceneExpression(bpy.types.Operator):
    """Removes the active expression from the scene"""

    bl_idname = "remove_scene_expression.golfcraft"
    bl_label = 'Remove Scene Expression'

    def execute(self, context):
        C = bpy.context
        D = bpy.data
        golfcraft_setup = context.scene.golfcraft_setup

        expression_collection = golfcraft_setup.expression_collection
        expression_collection.remove(golfcraft_setup.expression_collection_index)
        golfcraft_setup.expression_collection_index = len(golfcraft_setup.expression_collection) - 1

        return {'FINISHED'}

    def draw(self, context):
        pass


class AddObjectExpression(bpy.types.Operator):
    """Add a new expression to the active object"""

    bl_idname = "add_object_expression.golfcraft"
    bl_label = 'Add Object Expression'

    def execute(self, context):
        C = bpy.context
        D = bpy.data
        golfcraft_properties = context.active_object.golfcraft_properties

        expression_collection = golfcraft_properties.expression_collection
        expression_item = expression_collection.add()
        expression_item.name = "Expression"

        golfcraft_properties.expression_collection_index = (
            len(golfcraft_properties.expression_collection) - 1
        )

        return {'FINISHED'}

    def draw(self, context):
        pass


class RemoveObjectExpression(bpy.types.Operator):
    """Removes the active expression from the active object"""

    bl_idname = "remove_object_expression.golfcraft"
    bl_label = 'Remove Object Expression'

    def execute(self, context):
        C = bpy.context
        D = bpy.data
        golfcraft_properties = context.active_object.golfcraft_properties

        expression_collection = golfcraft_properties.expression_collection
        expression_collection.remove(golfcraft_properties.expression_collection_index)
        golfcraft_properties.expression_collection_index = len(golfcraft_properties.expression_collection) - 1

        return {'FINISHED'}

    def draw(self, context):
        pass

class WireDisplayToggle(bpy.types.Operator):
    """Display Physics objects wire/solid toggle"""
    bl_idname = "gc.display_physics_objects"
    bl_label = 'Show as wires or texture mode'
    enum_items = (
        ('WIRE', 'Wire', '', 'SHADING_WIRE', 0),
        ('SOLID', 'Solid', '', 'SHADING_SOLID', 1),
        ('HIDDEN', 'Hidden', '', 'HIDE_ON', 2),
        ('SHOW', 'Show', '', 'HIDE_OFF', 3),
    )
    action : bpy.props.EnumProperty(items=enum_items)

    @classmethod
    def poll(cls, context):
        if (context.area.ui_type == 'VIEW_3D'):
            return True

    def execute(self, context):
        C = bpy.context
        D = bpy.data
        physics_objects = []
        for ob in C.view_layer.objects:
            if ob.name.endswith("_cannon") or ob.name.endswith("_collider"):
                physics_objects.append(ob)

        if self.action == 'WIRE':
            for ob in physics_objects:
                ob.display_type = 'WIRE'
                ob.hide_set(False)
        elif self.action == 'SOLID':
            for ob in physics_objects:
                ob.display_type = 'TEXTURED'
                ob.hide_set(False)
        elif self.action == 'HIDDEN':
            for ob in physics_objects:
                ob.hide_set(True)
        else:
            for ob in physics_objects:
                ob.hide_set(False)

        return {'FINISHED'}

class CreateRenderCollection(bpy.types.Operator):
    """Create Render Collection (overwrites pre-existing ones)"""
    bl_idname = "gc.create_render_collection"
    bl_label = "Create render collection"
    bl_options = {'REGISTER', 'UNDO'}

    # Creation Settings
    active_camera: bpy.props.BoolProperty(
        name="Set Active Camera",
        description="Active camera, used for rendering the scene",
        default=True,
    )

    @classmethod
    def poll(cls, context):
        if (context.area.ui_type == 'VIEW_3D'):
            return True

    def execute(self, context):
        D = bpy.data
        C = bpy.context
        # Create render collection and link to main collection
        if not "render" in D.collections:
            collection = D.collections.new("render")
            C.scene.collection.children.link(collection)
        else:
            collection = D.collections["render"]
        
        # Set default color of render collection
        collection.color_tag = 'COLOR_07'

        # Create Camera
        if not "parts_camera" in D.cameras:
            cam = D.cameras.new("parts_camera")
        else:
            cam = D.cameras["parts_camera"]

        if not "parts_camera" in D.objects:
            camera = D.objects.new("parts_camera", cam)
            collection.objects.link(camera)
        else:
            camera = D.objects["parts_camera"]

        # Create Light 01
        if not "light_01" in D.lights:
            sub_light_01 = D.lights.new("light_01", type='SUN')
        else:
            sub_light_01 = D.lights["light_01"]

        if not "light_01" in D.objects:
            light_01 = D.objects.new("light_01", sub_light_01)
            collection.objects.link(light_01)
        else:
            light_01 = D.objects["light_01"]

        # Create Light 02
        if not "light_02" in D.lights:
            sub_light_02 = D.lights.new("light_02", type='SUN')
        else:
            sub_light_02 = D.lights["light_02"]

        if not "light_02" in D.objects:
            light_02 = D.objects.new("light_02", sub_light_02)
            collection.objects.link(light_02)
        else:
            light_02 = D.objects["light_02"]
        
        # Set-up lights power
        sub_light_01.energy = 4
        sub_light_02.energy = 12

        # Camera and lights rotation
        camera.rotation_euler = (1, 0, .5)
        light_01.rotation_euler = (1.3, -0.4, -0.5)
        light_02.rotation_euler = (-1.3, -1.2, -1)

        # Create Empty (for orbitation)
        if not "parts_camera_parent" in D.objects:
            empty = D.objects.new("parts_camera_parent", None)
            empty.empty_display_size = 5
            empty.empty_display_type = 'PLAIN_AXES'
            collection.objects.link(empty)
        else:
            empty = D.objects["parts_camera_parent"]

        # Parent camera and lights to empty
        camera.parent = empty
        light_01.parent = empty
        light_02.parent = empty
        
        # Set scene active camera
        if self.active_camera:
            C.scene.camera = camera

        fit_camera_to_visible_meshes()

        return{'FINISHED'}

    # Popup
    def invoke(self, context, event):
        return context.window_manager.invoke_props_dialog(self)
    # Custom Draw
    def draw(self, context):
        layout = self.layout
        layout.use_property_split = True
        layout.prop(self, "active_camera")


class SavePartCamera(bpy.types.Operator):
    """Save or overwrite camera for current part"""
    bl_idname = "gc.save_part_camera"
    bl_label = "Save part camera"
    bl_options = {'REGISTER', 'UNDO'}


    @classmethod
    def poll(cls, context):
        if (context.area.ui_type == 'VIEW_3D'):
            return True

    def execute(self, context):
        D = bpy.data
        C = bpy.context
        render_collection = D.collections["render"]

        active_collections = 0
        # Count enabled collections
        for col in C.view_layer.layer_collection.children:
            if not col.exclude:
                active_collections += 1
            else:
                pass
        if active_collections > 1:
            self.report({'ERROR'}, "Only works with one part collection at the same time")
            return {'CANCELLED'}
        if active_collections < 1:
            self.report({'ERROR'}, "Needs to enable one part collection")
            return {'CANCELLED'}        
        else: 
            for col in C.view_layer.layer_collection.children:
                if not col.exclude:
                    part_collection = col
                      
        # Create Camera
        if not part_collection.name in D.cameras:
            part_camera_data = D.cameras.new(part_collection.name)
        else:
            part_camera_data = D.cameras[part_collection.name]

        if not part_collection.name in D.objects:
            part_camera_object = D.objects.new(part_collection.name, part_camera_data)
            render_collection.objects.link(part_camera_object)
        else:
            part_camera_object = D.objects[part_collection.name]
            if part_camera_object.name in D.collections[part_collection.name].objects:
                D.collections[part_collection.name].objects.unlink(part_camera_object)
            if not part_camera_object.name in render_collection.objects:
                render_collection.objects.link(part_camera_object)

        part_camera_object.matrix_world = D.objects["parts_camera"].matrix_world

        return{'FINISHED'}


class CameraMovement(bpy.types.Operator):
    """Move, Zoom, Orbit and Fit camera"""
    bl_idname = "gc.camera_movement"
    bl_label = "Camera Movement"
    bl_options = {'REGISTER', 'UNDO'}
    enum_items = (
        ('ZOOM_IN', "Zoom-In", ""),
        ('ZOOM_OUT', "Zoom-Out", ""),
        ('MOVE_UP', "Move-Up", ""),
        ('MOVE_DOWN', "Move-Down", ""),
        ('FIT_VIEW', "Fit View", ""),
        ('ORBIT_180', "Orbit 180 Degrees", ""),
        ('ORBIT_LEFT', "Orbit Left", ""),
        ('ORBIT_RIGHT', "Orbit Right", ""),
    )
    action : bpy.props.EnumProperty(items=enum_items)

    @classmethod
    def poll(cls, context):
        if (context.area.ui_type == 'VIEW_3D'):
            return True

    def execute(self, context):
        if self.action == 'ZOOM_IN':
            camera_translation(0,-0.5)
        elif self.action == 'ZOOM_OUT':
            camera_translation(0,0.5)
        elif self.action == 'MOVE_UP':
            camera_translation(0.1,0)
        elif self.action == 'MOVE_DOWN':
            camera_translation(-0.1,0)
        elif self.action == 'FIT_VIEW':
            fit_camera_to_visible_meshes()
        elif self.action == 'ORBIT_LEFT':
            camera_orbitation(0.261799)
            fit_camera_to_visible_meshes()
        elif self.action == 'ORBIT_RIGHT':
            camera_orbitation(-0.261799)
            fit_camera_to_visible_meshes()
        else:
            camera_orbitation(3.14159)
            fit_camera_to_visible_meshes()

        return{'FINISHED'}

def camera_translation(height, zoom):
    camera = bpy.context.scene.camera
    loc = Matrix.Translation((0.0, height, zoom))
    camera.matrix_basis @= loc

def camera_orbitation(orbitation):
    D = bpy.data
    camera_parent = D.objects["parts_camera_parent"]
    camera_parent.rotation_euler.z -= orbitation

def fit_camera_to_visible_meshes():
    C = bpy.context
    D = bpy.data
    for ob in C.visible_objects:
        if ob.type == 'MESH':
            ob.select_set(True)
    bpy.ops.view3d.camera_to_view_selected()
    for ob in C.visible_objects:
        ob.select_set(False)
    # Add small zoom-out
    camera = D.objects["parts_camera"]
    loc = Matrix.Translation((0.0, 0.0, 0.1))
    camera.matrix_basis @= loc


def menu_func_export(self, context):
    self.layout.operator(ExportGolfcraft.bl_idname, text="Golfcraft (.json)")

class GolfcraftPreferences(AddonPreferences):
    bl_idname = __name__

    credentials_path: StringProperty(name="Credentials file", default="", subtype='FILE_PATH', options={'HIDDEN', 'SKIP_SAVE'})
    api_url: StringProperty(name="Endpoint URL", default="https://golfcraftgame.com", options={'HIDDEN', 'SKIP_SAVE'})

    def draw(self, context):
        layout = self.layout

        layout.prop(self, "credentials_path")
        layout.prop(self, "api_url")

class ParentGolfcraftPanel(bpy.types.Panel):
    bl_label = "Golfcraft"
    bl_idname = "OMV_PT_Golfcraft_Panel"
    bl_space_type = 'VIEW_3D'
    bl_region_type = 'UI'
    bl_category = 'DCL'

    def draw(self, context):
        pass

class SetupGolfcraftPanel(bpy.types.Panel):
    bl_idname = "OBJECT_PT_object_golfsetup"
    bl_label = "Scene"
    bl_space_type = 'VIEW_3D'
    bl_region_type = 'UI'
    bl_category = 'DCL'
    bl_parent_id = "OMV_PT_Golfcraft_Panel"

    def draw(self, context):
        layout = self.layout
        layout.use_property_split = True
        layout.use_property_decorate = False
        # golfcraft_properties = context.active_object.golfcraft_properties
        golfcraft_setup = context.scene.golfcraft_setup

        layout.prop(golfcraft_setup, "scene_type")
        if golfcraft_setup.scene_type_index == 0:
            layout.prop(golfcraft_setup, "export_path_3dmodels")
            layout.prop(golfcraft_setup, "export_path_cannon_definitions")
        else:
            layout.prop(golfcraft_setup, "export_path_course_definitions")
            layout.label(text="Course Expressions:")
            layout.template_list(
                "UI_UL_list",
                "ui_lib_list_prop",
                golfcraft_setup,
                "expression_collection",
                golfcraft_setup,
                "expression_collection_index",
                rows=5,
            )

            layout.operator("add_scene_expression.golfcraft", icon="ADD", text="Add")

            if len(golfcraft_setup.expression_collection) > 0:
                layout.operator("remove_scene_expression.golfcraft", icon="REMOVE", text="Remove")
                expression_index = golfcraft_setup.expression_collection_index
                layout.prop(golfcraft_setup.expression_collection[expression_index], "expression", text="")


class ObjectGolfcraftPanel(bpy.types.Panel):
    bl_idname = "OBJECT_PT_object_golfcraft"
    bl_label = "Object Properties"
    bl_space_type = 'VIEW_3D'
    bl_region_type = 'UI'
    bl_category = 'DCL'
    bl_parent_id = "OMV_PT_Golfcraft_Panel"

    def draw(self, context):
        layout = self.layout
        layout.use_property_split = True
        layout.use_property_decorate = False
        if context.active_object is None:
            return
        golfcraft_properties = context.active_object.golfcraft_properties
        golfcraft_setup = context.scene.golfcraft_setup
        if golfcraft_setup.scene_type_index == 0:
            layout.prop(golfcraft_properties, "material")
        else:
            layout.label(text="Element Expressions:")
            layout.template_list(
                "UI_UL_list",
                "ui_lib_list_prop",
                golfcraft_properties,
                "expression_collection",
                golfcraft_properties,
                "expression_collection_index",
                rows=2,
            )

            layout.operator("add_object_expression.golfcraft", icon="ADD", text="Add")

            if len(golfcraft_properties.expression_collection) > 0:
                layout.operator("remove_object_expression.golfcraft", icon="REMOVE", text="Remove")
                expression_index = golfcraft_properties.expression_collection_index
                layout.prop(golfcraft_properties.expression_collection[expression_index], "expression", text="")
        

class RenderGolfcraftPanel(bpy.types.Panel):
    bl_label = "Render & Visibility"
    bl_idname = "OBJECT_PT_render_panel"
    bl_space_type = 'VIEW_3D'
    bl_region_type = 'UI'
    bl_category = 'DCL'
    bl_parent_id = "OMV_PT_Golfcraft_Panel"
 
    def draw(self,context):
        C = bpy.context
        D = bpy.data
        layout = self.layout

        col = layout.column(align=True)
        if not "render" in bpy.data.collections:
            col.operator("gc.create_render_collection", icon='VIEW_CAMERA')
        else:
            col.operator("gc.create_render_collection", icon='VIEW_CAMERA', text="Reset render collection")
        if "render" in bpy.data.collections:
            box = col.box()
            row = box.row()
            col = row.grid_flow(row_major=True, columns=2, align=True)
            col.operator("gc.camera_movement", icon="LOOP_BACK", text="").action = 'ORBIT_LEFT'
            col.operator("gc.camera_movement", icon="LOOP_FORWARDS", text="").action = 'ORBIT_RIGHT'
            col.operator("gc.camera_movement", text="180°").action = 'ORBIT_180'
            col.operator("gc.camera_movement", text="Fit").action = 'FIT_VIEW'

            col = row.grid_flow(row_major=False, columns=2, align=True, even_columns=True)
            col.scale_x = 2
            col.operator("gc.camera_movement", icon="SORT_DESC", text="").action = 'MOVE_UP'
            col.operator("gc.camera_movement", icon="SORT_ASC", text="").action = 'MOVE_DOWN'
            col.operator("gc.camera_movement", icon="ZOOM_IN", text="").action = 'ZOOM_IN'
            col.operator("gc.camera_movement", icon="ZOOM_OUT", text="").action = 'ZOOM_OUT'

        # Physics objects display toggle
        row = layout.row(align=True)
        row.label(text="Physics Visibility:")
        row.operator_enum("gc.display_physics_objects", "action", icon_only=True)

        layout.separator()
        if "render" in D.collections:
            layout.operator("gc.save_part_camera", icon='CURRENT_FILE')

class ExportGolfcraftPanel(bpy.types.Panel):
    bl_idname = "OBJECT_PT_export_golfcraft"
    bl_label = "Export"
    bl_space_type = 'VIEW_3D'
    bl_region_type = 'UI'
    bl_category = 'DCL'
    bl_parent_id = "OMV_PT_Golfcraft_Panel"

    def draw(self, context):
        layout = self.layout
        # layout.use_property_split = True
        # layout.use_property_decorate = False
        golfcraft_setup = context.scene.golfcraft_setup
        layout.prop(golfcraft_setup, "export_to_database")
        layout.prop(golfcraft_setup, "export_to_disk")
        if golfcraft_setup.scene_type_index == 0:
            layout.prop(golfcraft_setup, "export_gltf")
            if golfcraft_setup.export_gltf:
                layout.prop(golfcraft_setup, "export_animations")
            layout.operator("export_part.golfcraft", icon='EXPORT')
        else:
            layout.operator("export_level.golfcraft")


def draw_menu(self, context):
    layout = self.layout
    layout.operator("object.golfsetup")
    layout.operator("object.golfcraft")
    layout.operator("export.golfcraft")


class CollidersGolfcraftPanel(bpy.types.Panel):
    bl_label = "Export all visible colliders"
    bl_idname = "OBJECT_PT_export_colliders_panel"
    bl_space_type = 'VIEW_3D'
    bl_region_type = 'UI'
    bl_category = 'DCL'
    bl_parent_id = "OMV_PT_Golfcraft_Panel"
 
    def draw(self,context):
        layout = self.layout
        golfcraft_setup = context.scene.golfcraft_setup

        layout.use_property_split = True
        layout.use_property_decorate = False
        layout.prop(golfcraft_setup, "export_colliders_path", text="Path")
        layout.operator("gc.export_colliders", icon='CUBE')
        
class ThumbnailsGolfcraftPanel(bpy.types.Panel):
    bl_label = "Highres Thumbnails"
    bl_idname = "OBJECT_PT_thumbnails_panel"
    bl_space_type = 'VIEW_3D'
    bl_region_type = 'UI'
    bl_category = 'DCL'
    bl_parent_id = "OMV_PT_Golfcraft_Panel"
 
    def draw(self,context):
        layout = self.layout
        golfcraft_setup = context.scene.golfcraft_setup

        layout.use_property_split = True
        layout.use_property_decorate = False
        layout.prop(golfcraft_setup, "use_compositor_background")
        layout.prop(golfcraft_setup, "export_thumbnails_path", text="Path")
        layout.prop(golfcraft_setup, "export_thumbnails_size", text="Size (px)")
        layout.prop(golfcraft_setup, "export_thumbnails_ignored_collections")
        layout.operator("gc.export_thumbnails", icon='IMAGE_DATA')


GolfcraftProperties = namedtuple(
    "GolfcraftSettings",
    [
        "name",
        "restitution",
        "material",
        "material_index"
    ]
)

GolfcraftSettings = namedtuple(
    "GolfcraftProperties",
    [
        "materials_collection",
        "materials_collection_index",
        "export_path_3dmodels",
        "export_path_cannon_definitions",
        "export_path_course_definitions",
    ]
)


def FBXG_Mode_old(self, context):
    items = []
    golfcraft_setup = context.scene.golfcraft_setup
    for elib in golfcraft_setup.materials_collection:
        items.append((elib.name, elib.name, "", elib.index))
    return items


# Materials Enum
def Golfcraft_Materials(self, context):
    # Weird IDs for backward compatibility
    items = [
        ("none", "None", "", 0),
        ("grass", "Grass", "", 894990),
        ("wood", "Wood", "", 683608),
        ("dumper", "Dumper", "", 951681)
    ]
    return items


def get_enum_material(self):
    golfcraft_properties = self
    return golfcraft_properties.material_index


def set_enum_material(self, value):
    golfcraft_properties = self
    golfcraft_properties.material_index = value


# Scene Type Enum
def Scene_Type(self, context):
    items = [
        ("parts", "Parts", "", 0),
        ("levels", "Levels", "", 1)
    ]
    return items


def get_enum_scene_type(self):
    golfcraft_properties = self
    return golfcraft_properties.scene_type_index


def set_enum_scene_type(self, value):
    golfcraft_properties = self
    golfcraft_properties.scene_type_index = value


# Object Properties

class ExpressionGroup(bpy.types.PropertyGroup):
    name: StringProperty(name="Name", default="")
    expression: StringProperty(name="Expression", default="")
    index: IntProperty(name="Expression Id", default=0)


class ObjectGolfcraftProperties(bpy.types.PropertyGroup):

    expression_collection: CollectionProperty(
        type=ExpressionGroup,
        options={'SKIP_SAVE'}
    )

    expression_collection_index: IntProperty(
        options={'SKIP_SAVE'}
    )

    values: StringProperty(
        name="Custom Values",
        default="",
        description="Custom values for the element",
    )

    material: EnumProperty(
        name="Cannon Material",
        items=Golfcraft_Materials,
        get=get_enum_material,
        set=set_enum_material,
        options={'SKIP_SAVE'}
    )

    material_index: IntProperty(
        name="Cannon Material Index",
        default=0,
        options={'SKIP_SAVE'}
    )

    def to_settings(self):
        return GolfcraftProperties(
            expression_collection=self.expression_collection,
            expression_collection_index=self.expression_collection_index,
            values=self.values,
            material=self.material,
            material_index=self.material_index
        )


class SceneGolfcraftSetup(bpy.types.PropertyGroup):

    expression_collection: CollectionProperty(
        name="Scene Expressions",
        type=ExpressionGroup,
        options={'SKIP_SAVE'}
    )

    expression_collection_index: IntProperty(
        default=0,
        options={'SKIP_SAVE'}
    )

    export_path_3dmodels: StringProperty(
        name="3D models",
        subtype='DIR_PATH'
    )

    export_path_course_definitions: StringProperty(
        name="Course Definitions",
        subtype='DIR_PATH'
    )

    export_path_cannon_definitions: StringProperty(
        name="Cannon Definitions",
        subtype='DIR_PATH'
    )

    scene_type: EnumProperty(
        name="Scene Type",
        items=Scene_Type,
        get=get_enum_scene_type,
        set=set_enum_scene_type,
        options={'SKIP_SAVE'}
    )

    scene_type_index: IntProperty(
        name="Scene Type Index",
        default=0,
        options={'SKIP_SAVE'}
    )

    export_gltf: BoolProperty(
        name="Export glTF",
        default=True
    )

    export_animations: BoolProperty(
        name="Export animations",
        default=False
    )

    export_to_database: BoolProperty(
        name="Export to database",
        default=True
    )

    export_to_disk: BoolProperty(
        name="Export to disk",
        default=False
    )
    export_colliders_path: StringProperty(
        name="Colliders path",
        default="//",
        subtype='FILE_PATH'
    )
    export_thumbnails_path: StringProperty(
        name="Thumbnails path",
        default="//",
        subtype='FILE_PATH'
    )
    export_thumbnails_size: IntProperty(
        name="Thumbnails size",
        default=1024,
    )
    export_thumbnails_ignored_collections: StringProperty(
        name="Excluded collections",
        default="render"
    )
    use_compositor_background: BoolProperty(
        name="Use compositor background",
        default=True,
        description="Disable this for renders with transparent background"
    )
    def to_settings(self):
        return GolfcraftSettings(
            expression_collection=self.expression_collection,
            expression_collection_index=self.expression_collection_index,
            export_path_3dmodels=self.export_path_3dmodels,
            export_path_course_definitions=self.export_path_course_definitions,
            export_path_cannon_definitions=self.export_path_cannon_definitions,
            scene_type=self.scene_type,
            scene_type_index=self.scene_type_index,
            export_gltf=self.export_gltf,
            export_to_database=self.export_to_database,
            export_to_disk=self.export_to_disk
        )


classes = (
    GolfcraftPreferences,

    ExportGolfcraftPart,
    ExportPartsColliders,
    ExportPartsThumbnails,
    ExportGolfcraftLevel,
    AutofillPartValues,
    AddSceneExpression,
    RemoveSceneExpression,
    AddObjectExpression,
    RemoveObjectExpression,
    WireDisplayToggle,
    CreateRenderCollection,
    SavePartCamera,
    CameraMovement,

    ParentGolfcraftPanel,
    SetupGolfcraftPanel,
    ObjectGolfcraftPanel,
    RenderGolfcraftPanel,
    ExportGolfcraftPanel,
    CollidersGolfcraftPanel,
    ThumbnailsGolfcraftPanel,

    ExpressionGroup,
    ObjectGolfcraftProperties,
    # GolfcraftMaterialProperties,
    SceneGolfcraftSetup
)


def register():
    for cls in classes:
        bpy.utils.register_class(cls)

    # bpy.types.TOPBAR_MT_file_import.append(menu_func_import)
    bpy.types.TOPBAR_MT_file_export.append(menu_func_export)
    bpy.types.VIEW3D_MT_object.append(draw_menu)

    bpy.types.Object.golfcraft_properties = PointerProperty(type=ObjectGolfcraftProperties)
    bpy.types.Scene.golfcraft_setup = PointerProperty(type=SceneGolfcraftSetup)


def unregister():
    # bpy.types.TOPBAR_MT_file_import.remove(menu_func_import)
    bpy.types.TOPBAR_MT_file_export.remove(menu_func_export)
    bpy.types.VIEW3D_MT_object.remove(draw_menu)

    for cls in classes:
        bpy.utils.unregister_class(cls)

    del bpy.types.Object.golfcraft_properties
    del bpy.types.Scene.golfcraft_setup


if __name__ == "__main__":
    register()