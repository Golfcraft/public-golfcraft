import AdminJS, {NotFoundError, ValidationError} from "adminjs";
import {DMMFClass} from "@prisma/client/runtime";
import AdminJSExpress from '@adminjs/express'
import {pipe,defaultChestRewardChances} from "../../../../common/utils";
const PARENT_GOLF_COURSES = {name:"Golf courses", icon:"Heat map"};
const PARENT_TOURNAMENT = {name:"Tournaments", icon:"Game console"};
const PARENT_ADMIN = {name:"Admin", icon:"Game console"};
const PARENT_LOGS = {name:"Logs", icon:"Game console" };
const STATUS_PROPERTY_DEF = {availableValues:[
    {value:0, label:'WIP'},
    {value:1, label:'REVIEW'},
    {value:2, label:'DEPLOYED'},
    {value:3, label:'DECLINED'},
    {value:4, label: "VALIDATED"}
]};
const Thumbnail64 = AdminJS.bundle("../../../admin/components/thumbnail64");
const RecordIdAlias = AdminJS.bundle("../../../admin/components/partIdAlias");
const JSONViewer = AdminJS.bundle("../../../admin/components/JsonViewer");
const JSONEditor = AdminJS.bundle("../../../admin/components/JsonEditor");
const passwordFeature = require('@adminjs/passwords');
const argon2 = require('argon2');
const onlyAdmin = (context) => context.currentAdmin?.role === "admin";
const onlyAdminAndEditor = (context) => context.currentAdmin?.role === "admin" || context.currentAdmin?.role === "editor";
const onlyAdminAndMarketing = (context) => context.currentAdmin?.role === "marketing" || context.currentAdmin?.role === "admin";
const onlyAdminAndEditorAndMarketing = (context) => context.currentAdmin?.role === "marketing" || context.currentAdmin?.role === "admin" ||  context.currentAdmin?.role === "editor";

const actionOptionGetter = (accessFn:Function, actionNames:string[], optionProperties:string[]) => (acc) => {
    const _acc = acc || {}
    actionNames.forEach(actionName => {
        _acc[actionName] = _acc[actionName] || {};
        optionProperties.forEach(optionProperty => {
            Object.assign(_acc[actionName], {[optionProperty]: accessFn})
        })
    })
    return _acc;
};
const extendOnlyAdminActions = actionOptionGetter(onlyAdmin, ["edit", "delete", "new", "list", "show"], ["isAccessible"]);
const extendOnlyAdminAndEditorActions = actionOptionGetter(onlyAdminAndEditor, ["edit", "delete", "new", "list", "show"], ["isAccessible"]);
const extendOnlyAdminAndEditorAndMarketingActions = actionOptionGetter(onlyAdminAndEditorAndMarketing, ["edit", "delete", "new", "list", "show"], ["isAccessible"])

const courseActionOptions = pipe(
    extendOnlyAdminAndEditorActions,
    actionOptionGetter(onlyAdminAndEditorAndMarketing, [], ["isAccessible"]),
    actionOptionGetter(()=>true, ["list", "show"], ["isAccessible"]),
)
({});

const courseActionOptionsEditor = pipe(
    extendOnlyAdminAndEditorActions,
    actionOptionGetter(onlyAdminAndEditorAndMarketing, ["apply", "decline", "readyForReview"], ["isAccessible"])
)
(getModificationActions({resourceId: 'courses', foreignIdColumn: 'course_ID'} as any));

BigInt.prototype["toJSON"] = function() { return this.toString() }
const LOG_TYPE_VALUES = [{"value":1,"label":"QUEUED"},{"value":2,"label":"START"},{"value":3,"label":"STEP"},{"value":4,"label":"COMPLETED"},{"value":5,"label":"FAILED"},{"value":6,"label":"REMOVED"},{"value":7,"label":"ESTIMATE_FAILED"},{"value":8,"label":"TX_FAILED"},{"value":9,"label":"TX_SENT"},{"value":10,"label":"FAILED_REMOVED"},{"value":11,"label":"WAITING_CONFIRMATION"},{"value":12,"label":"RECEIPT"},{"value":13,"label":"BEFORE_FAILED"},{"value":14,"label":"AFTER_FAILED"},{"value":16,"label":"BEFORE_SENT"},
    {"value":17,"label":"TX_DROPPED"},{"value":17,"label":"PRE_REVERT"}
];

export const initAdmin = (prisma) => {
    const duplicateCourseActionExtension = {
        duplicateCourse:{
            actionType:"record",
            icon:"CopyFile",
            guard:"Duplicate this course?",
            component:false,
            handler:getGuardedHandler(async ({ request, response, record, resource, currentAdmin, h, _admin, translateMessage })=>{
                const courseModificationRecord = (await prisma.course_modification.findMany({where:{course_ID:record.params.ID}}, {}))[0];
                const definition = courseModificationRecord ? courseModificationRecord.definition : record.params.definition;
                const numberOfCopies = await prisma.courses.count({where:{alias:{contains:`${record.params.alias.replace(/_copy\d*/,"")}_copy`}}});
                const alias = `${record.params.alias.replace(/_copy\d*/,"")}_copy${(numberOfCopies +1)}`;
                const creationData = {
                    ...record.params,
                    alias,
                    definition:typeof definition === "string" ? definition : JSON.stringify(definition) ,
                    displayName:alias,
                    created:new Date(),
                    evaluation:null,
                    averageTime:null,
                    timesAbandoned:null,
                    timesPlayed:0,
                    rewards:null,
                    averageArea:null,
                    averageDistance:null,
                    averageShoots:null,
                    publishing:null,
                    ID:undefined,
                    isSeason:null,
                    status:0
                };
                return await prisma.courses.create({data:creationData});
            })
        }
    };
    const dmmf = ((prisma as any)._dmmf as DMMFClass);
    const adminJs = new AdminJS({
        //rootPath:"/admin",
        branding:{
            companyName:"Golfcraft Admin",
            logo:"https://golfcraftgame.com/static/images/logo.png",
        },
        resources: [{
            resource: { model: dmmf.modelMap.courses, client: prisma },
            options: {
                parent:PARENT_GOLF_COURSES,
                properties:{
                    ID:{isId:true,isDisabled:true},
                    definition:{
                        isVisible:{ list:false, filter:false, show:true, edit:true },
                        isSortable:false
                    },
                    created:{isDisabled:true},
                    updated:{isDisabled:false},
                    createdBy:{},
                    updatedBy:{},
                    status:STATUS_PROPERTY_DEF,
                    mode:{ isVisible:{ list:true, filter:true, show:true, edit:true }},
                    subType:{isVisible:{ list:true, filter:true, show:true, edit:true }},
                    minTierCat:{isVisible:{list:true, filter:true, show:true, edit:true }}
                },
                sort:{direction:"desc", sortBy:"ID"},
                listProperties:["ID","alias","displayName","status","authorName","minTierCat","evaluation","timesPlayed","timesAbandoned","averageTime"],
                actions: {...courseActionOptions, ...duplicateCourseActionExtension, list: {
                        after: async (response, request, context) => {
                            return {
                                ...response,
                                records: response.records.map(r=>({ ...r, evaluation:0 }))
                            };
                        },
                    },}
            },
        },{
            resource: {model: dmmf.modelMap.parts, client: prisma},
            options:{
                parent:PARENT_GOLF_COURSES,
                listProperties: ["ID", "alias", "thumbnail64", "created", "updated", "status", "drop_chance", "drop_alias", "recipe"],
                properties:{
                    ID:{isId:true,isDisabled:true},
                    definition:{
                        isVisible:{ list:false, filter:false, show:true, edit:true },
                        isSortable:false
                    },
                    thumbnail64:{
                        isVisible:{ list:true, filter:false, show:true, edit:true },
                        isSortable:false,
                        components:{ list:Thumbnail64 }
                    },
                    created:{isDisabled:true},
                    updated:{isDisabled:true},
                    status:STATUS_PROPERTY_DEF
                },
                actions:courseActionOptionsEditor
            }
        },{
            resource: {model: dmmf.modelMap.course_modification, client: prisma},
            options:{
                parent:PARENT_GOLF_COURSES,
                properties: {
                    ID:{isId:true,isDisabled:true},
                    course_ID:{
                        components:{
                            list:RecordIdAlias,
                            show:RecordIdAlias
                        }
                    },
                    definition:{
                        isVisible:{ list:false, filter:false, show:true, edit:true },
                        isSortable:false
                    },
                    previous:{
                        isVisible:{ list:false, filter:false, show:true, edit:true },
                        isSortable:false
                    },
                    status:STATUS_PROPERTY_DEF
                },
                actions:pipe(
                    actionOptionGetter(onlyAdminAndEditorAndMarketing, ["new", "list", "show","apply", "decline", "readyForReview"], ["isAccessible"]),
                )
                (getModificationActions({resourceId: 'courses', foreignIdColumn: 'course_ID'} as any))
            }
        },{
            resource: {model: dmmf.modelMap.part_modification, client:prisma},
            options:{
                parent:PARENT_GOLF_COURSES,
                properties:{
                    ID:{
                        isId:true,
                        isDisabled:true,
                    },
                    part_ID:{
                        components:{
                            list:RecordIdAlias,
                            show:RecordIdAlias
                        }
                    },
                    definition:{
                        isVisible:{ list:false, filter:false, show:true, edit:true },
                        isSortable:false
                    },
                    status:STATUS_PROPERTY_DEF,
                    thumbnail64:{
                        isVisible:{ list:true, filter:false, show:true, edit:true },
                        isSortable:false,
                        components:{ list:Thumbnail64, show:Thumbnail64 }
                    },
                    previous:{
                        isVisible:{ list:false, filter:false, show:true, edit:true },
                        isSortable:false
                    },
                },
                actions:pipe(
                    extendOnlyAdminAndEditorActions,
                    actionOptionGetter(onlyAdminAndEditor, ["apply", "decline", "readyForReview"], ["isAccessible"]),
                )(getModificationActions({
                    resourceId:'parts',
                    foreignIdColumn:'part_ID',
                    fields:["definition", "thumbnail64", "boundingBox"]
                }))
            }
        },{
            resource:{
                model: dmmf.modelMap.tournaments,
                client:prisma
            },
            options:{
                parent:PARENT_TOURNAMENT,
                sort:{
                    sortBy: "ID",
                    direction:"desc"
                },
                actions:extendOnlyAdminAndEditorAndMarketingActions({})
            }
        },
            {
                resource:{model: dmmf.modelMap.tournament_participant, client:prisma},
                options:{
                    parent:PARENT_TOURNAMENT,
                    sort:{
                        sortBy: "participationID",
                        direction:"desc"
                    },
                    actions:extendOnlyAdminAndEditorAndMarketingActions({})
                }
            },{
            resource: {
                model:dmmf.modelMap.admin_users,
                client:prisma,
            },
            options: {
                parent:PARENT_ADMIN,
                actions:extendOnlyAdminActions({}),
                properties: {
                    password:{
                        isVisible:{
                            edit:false, new:false, show:false, filter:false, list:false
                        }
                    }
                }
            },
            features: [passwordFeature({
                properties: {
                    encryptedPassword: 'password',
                    password:'pass'
                },
                hash: argon2.hash,
            })]
        },{
            resource: {
                model:dmmf.modelMap.chain_queuer_actions,
                client:prisma,
            },
            new:false,
            options:{
                parent:PARENT_LOGS,
                sort:{
                    sortBy: "ID",
                    direction:"desc"
                },
                actions:{
                    new:{isAccessible:false},
                    edit:{isAccessible:false},
                    delete:{isAccessible:false},
                    show:{isAccessible:onlyAdminAndEditor},
                    list:{isAccessible:onlyAdminAndEditor}
                },
            }
        },
            {
                resource: {
                    model:dmmf.modelMap.chain_queuer_logs,
                    client:prisma,
                },
                new:false,
                options:{
                    parent:PARENT_LOGS,
                    sort:{
                        sortBy: "ID",
                        direction:"desc"
                    },
                    actions:{
                        new:{isAccessible:false},
                        edit:{isAccessible:false},
                        delete:{isAccessible:false},
                        show:{isAccessible:onlyAdminAndEditor},
                        list:{isAccessible:onlyAdminAndEditor}
                    },
                    properties:{
                        type:{
                            availableValues:LOG_TYPE_VALUES
                        }
                    }
                }
            },
            {
                resource: {
                    model:dmmf.modelMap.material_drops,
                    client:prisma
                },
                options:{
                    actions: extendOnlyAdminActions({})
                },
            },
            {
                resource: {
                    model:dmmf.modelMap.votes,
                    client:prisma
                },
                options:{
                    actions: extendOnlyAdminActions({})
                }
            },
            {
                resource: {
                    model:dmmf.modelMap.vote_reviewer,
                    client:prisma
                },
                options:{
                    actions: extendOnlyAdminActions({})
                }
            },
            {
                resource: {
                    model:dmmf.modelMap.player_game,
                    client:prisma
                },
                options:{
                    sort:{
                        sortBy: "ID",
                        direction:"desc"
                    },
                    actions: extendOnlyAdminActions({})
                }
            },
            {
                resource: {
                    model:dmmf.modelMap.confessions,
                    client:prisma
                },
                options:{
                    sort:{
                        sortBy: "ID",
                        direction:"desc"
                    },
                    actions: extendOnlyAdminAndEditorAndMarketingActions({})
                }
            },
            {
                resource:{
                    model:dmmf.modelMap.daily_missions,
                    client:prisma,
                },
                options:{
                    actions: extendOnlyAdminActions({})
                }
            },
            {
                resource: {
                    model:dmmf.modelMap.raffle,
                    client:prisma
                },
                options:{
                    sort:{
                        sortBy: "ID",
                        direction:"desc"
                    },
                    actions: extendOnlyAdminActions({})
                }
            },
            {
                resource: {
                    model:dmmf.modelMap.wearables_catalog,
                    client:prisma
                },
                options:{
                    sort:{
                        sortBy: "ID",
                        direction:"desc"
                    },
                    actions: extendOnlyAdminActions({})
                }
            },
            {
                resource: {
                    model:dmmf.modelMap.wearables_collections,
                    client:prisma
                },
                options:{
                    sort:{
                        sortBy: "name",
                        direction:"asc"
                    },
                    listProperties: ["name", "address"],
                    filterProperties: ["name", "address"],
                    editProperties: ["name", "address"],
                    showProperties: ["name", "address"],
                    actions: extendOnlyAdminActions({})
                }
            },
            {
                resource: {
                    model:dmmf.modelMap.recorded_game,
                    client:prisma
                },
                options:{
                    sort:{
                        sortBy: "ID",
                        direction:"desc"
                    },
                    actions: extendOnlyAdminActions({}),
                    properties: {
                        frames:{
                            components:{
                                list:JSONViewer,
                                show:JSONViewer,
                                edit:JSONEditor
                            }
                        }
                    }
                }
            },
            {
                resource: {
                    model:dmmf.modelMap.tiers,
                    client:prisma
                },
                options:{
                    sort:{
                        sortBy: "ID",
                        direction:"asc"
                    },
                    actions: extendOnlyAdminActions({})
                }
            },
            {
                resource: {
                    model:dmmf.modelMap.chest_events,
                    client:prisma
                },
                options:{
                    sort:{
                        sortBy: "ID",
                        direction:"desc"
                    },
                    actions: extendOnlyAdminAndEditorAndMarketingActions({}),
                    properties: {
                        chestRewardChances:{
                            components:{
                                list:JSONViewer,
                                show:JSONViewer,
                                edit:JSONEditor,
                                new:JSONEditor
                            },
                            default:defaultChestRewardChances
                        }
                    }
                }
            },
            {
                resource: {
                    model:dmmf.modelMap.random_rewards,
                    client:prisma
                },
                options:{
                    sort:{
                        sortBy: "ID",
                        direction:"desc"
                    },
                    actions: extendOnlyAdminActions({})
                }
            },
            {
                resource: {
                    model:dmmf.modelMap.tournament_organizer_reward,
                    client:prisma
                },
                options:{
                    sort:{
                        sortBy: "ID",
                        direction:"desc"
                    },
                    actions: extendOnlyAdminActions({})
                }
            },
            {
                resource: {
                    model:dmmf.modelMap.luckyball_contracts,
                    client:prisma
                },
                options:{
                    sort:{
                        sortBy: "created",
                        direction:"desc"
                    },
                    actions: extendOnlyAdminAndEditorAndMarketingActions({})
                },

            },
            {
                resource: {
                    model:dmmf.modelMap.affiliate_player,
                    client:prisma
                },
                options:{
                    actions: extendOnlyAdminAndEditorAndMarketingActions({})
                }
            },
            {
                resource: {
                    model:dmmf.modelMap.affiliates,
                    client:prisma
                },
                options:{
                    actions: extendOnlyAdminAndEditorAndMarketingActions({})
                }
            },
            {
                resource: {
                    model:dmmf.modelMap.config,
                    client:prisma
                },
                options:{
                    actions: extendOnlyAdminAndEditorAndMarketingActions({})
                }
            },
            {
                resource: {
                    model:dmmf.modelMap.live_tournament_participations,
                    client:prisma
                },
                options:{
                    actions: extendOnlyAdminActions({})
                }
            }
        ]
    })
    const adminRouter = AdminJSExpress.buildAuthenticatedRouter(adminJs, {
        authenticate: async (email, password) => {
            const user = await prisma.admin_users.findFirst({where:{ username:email }});
            if(!user) return false;
            if(!await argon2.verify(user.password,password)){
                return false;
            }
            return user;
        },
        cookiePassword: process.env.ADMIN_COOKIE_PASSWORD,
        }, undefined, {saveUninitialized: false, resave: false
    });

    return {admin:adminJs, adminRouter};
}

function getModificationActions({resourceId, foreignIdColumn, fields}){
    return {
        // edit:{isVisible:false},
        apply:{
            actionType:"record",
            icon:"Rocket",//https://www.carbondesignsystem.com/guidelines/icons/library/
            //        component:AdminJS.bundle(`../../../admin/components/decline`),
            guard:"DEPLOY this course modification?",
            component:false,
            isVisible:({record})=>record.params.status === 1 || record.params.status === 0,
            handler:getGuardedHandler(async ({ request, response, record, resource, currentAdmin, h, _admin, translateMessage })=>{
                const Resource = _admin.findResource(resourceId);
                const modifiedRecord = await Resource.findOne(record.params[foreignIdColumn]);

                await resource.update(record.params.ID, {status:2, previous:modifiedRecord.params.definition});
                if(fields){
                    const newParams = fields.reduce((acc, current)=>{
                        if(record.params[current]) acc[current] = record.params[current];
                        return acc;
                    },{});
                    await modifiedRecord.update({
                        ...newParams,
                        updated:new Date().toISOString()});
                }else{
                    await modifiedRecord.update({definition:record.params.definition, updated:new Date().toISOString()});
                }
            })
        },
        decline:{
            actionType:"record",
            variant: 'danger',
            icon:"Error",//https://www.carbondesignsystem.com/guidelines/icons/library/
            //        component:AdminJS.bundle(`../../../admin/components/decline`),
            guard:`DECLINE this ${resourceId} modification?`,
            isVisible:({record})=>record.params.status === 1 || record.params.status === 0,
            component:false,
            handler:getGuardedHandler(async ({ request, response, record, resource, currentAdmin, h, _admin, translateMessage })=>{
                await resource.update(record.params.ID, {status:3});
            })
        },
        readyForReview:{
            actionType:"record",
            icon:"Search",//https://www.carbondesignsystem.com/guidelines/icons/library/
            //        component:AdminJS.bundle(`../../../admin/components/decline`),
            guard:"READY FOR REVIEW this course modification?",
            isVisible:({record})=>record.params.status === 0,
            component:false,
            handler:getGuardedHandler(async ({ request, response, record, resource, currentAdmin, h, _admin, translateMessage })=>{
                await resource.update(record.params.ID, {status:1});
            })
        }
    }
}

function getGuardedHandler(execution) {
    return async (request, response, data)=>{
        const { record, resource, currentAdmin, h,_admin, translateMessage } = data
        if (!request.params.recordId || !record) {
            throw new NotFoundError([
                'You have to pass "recordId" to execute this Action',
            ].join('\n'), 'Action#handler')
        }
        try {
            const executionResult = await execution({ request, response, record, resource, currentAdmin, _admin, h, translateMessage });
        } catch (error) {
            console.log("error", error)
            if (error instanceof ValidationError && error.baseError) {
                return {
                    record: record.toJSON(currentAdmin),
                    notice: {
                        message: error.baseError.message,
                        type: 'error',
                    },
                }
            }
            throw error
        }
        return {
            record: record.toJSON(currentAdmin),
            redirectUrl: h.resourceUrl({ resourceId: resource._decorated?.id() || resource.id() }),
            notice: {
                message: translateMessage('Successfully executed', resource.id()),
                type: 'success',
            },
        }
    }
}
