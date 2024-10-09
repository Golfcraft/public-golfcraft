const identifier = "dcl-cube-0.0.11"; // #VX!-version
const baseURL = "https://api.versadex.xyz";
import { getUserData } from "@decentraland/Identity";
import {
	getCurrentRealm,
	getExplorerConfiguration,
} from "@decentraland/EnvironmentAPI";

export class VersadexImpression {
	public userData = executeTask(async () => {
		// user information & campaign holder
		const data = await getUserData();
		return data!;
	});
	public currentRealm = executeTask(async () => {
		// user information & campaign holder
		const data = await getCurrentRealm();
		return data!;
	});
	public explorerConfiguration = executeTask(async () => {
		// user information & campaign holder
		const data = await getExplorerConfiguration();
		return data!;
	});
	public physicsCast = PhysicsCast.instance;
	public camera = Camera.instance;
	private billboardID: string;
	private campaignID: string;
	private client_identifier: string;
	private billboardTransform: Transform;

	private impressionIdentifier: string;

	private userDistanceFlag: Boolean = false;
	private raycastNotLookingAtSI: Boolean = true;
	private raycastEntityValidation: Boolean = false;

	private startTimer!: number;
	private endTimer!: number;

	constructor(
		billboardID: string,
		campaignID: string,
		billboardTransform: Transform,
		client_identifier: string,
		impression_identifier: string
	) {
		this.billboardID = billboardID;
		this.campaignID = campaignID;
		this.billboardTransform = billboardTransform;
		this.client_identifier = client_identifier;
		this.impressionIdentifier = impression_identifier;
	}

	// proximity measurement
	distance(pos1: Vector3, pos2: Vector3): number {
		const a = pos1.x - pos2.x;
		const b = pos1.z - pos2.z;
		return a * a + b * b;
	}

	// direction measurement
	direction(pos1: Vector3, pos2: Vector3) {
		const a = pos1.x - pos2.x;
		const b = pos1.z - pos2.z;
		const c = pos1.y - pos2.y;
		return new Vector3(a, c, b);
	}
}
// chris@versadex.xyz

import { getUserData as getUserDataForImpression } from "@decentraland/Identity";

export type Props = {
	id: string;
	auto_rotate: Boolean;
};

export class VersadexLink extends Entity {
	constructor(position: Vector3, rotation: Quaternion, parent: Entity) {
		super();
		engine.addEntity(this);
		this.setParent(parent);
		this.addComponent(
			new Transform({
				position: position,
				scale: new Vector3(0.25, 0.1, 1),
				rotation: rotation,
			})
		);
		this.addComponent(new PlaneShape());
		// create the paper which always links to versadex
		const seeThrough = new Material();
		seeThrough.albedoColor = new Color4(0, 0, 0, 0);
		this.addComponent(seeThrough);
		this.addComponent(
			new OnPointerDown(
				() => {
					openExternalURL("https://versadex.xyz");
				},
				{ hoverText: "Advertise or monetise with Versadex" }
			)
		);
	}
}

export class VersadexPaper extends Entity {
	constructor(position: Vector3, rotation: Quaternion, parent: Entity) {
		super();
		engine.addEntity(this);
		this.setParent(parent);
		this.addComponent(
			new Transform({
				position: position,
				scale: new Vector3(0.9, 0.9, 1),
				rotation: rotation,
			})
		);
		const paperCollider = new PlaneShape();
		paperCollider.withCollisions = false;

		this.addComponent(paperCollider);
	}
}

// Define the system
export class RotateSystem implements ISystem {
	private entity: Entity;
	constructor(entity: Entity) {
		this.entity = entity;
	}

	update() {
		// Iterate over the entities in an component group
		let transform = this.entity.getComponent(Transform);
		transform.rotate(new Vector3(0, 1, 0), 1);
	}
}

export default class VersadexSmartItem implements IScript<Props> {
	init() {}

	public userData = executeTask(async () => {
		// user information & campaign holder
		const data = await getUserDataForImpression();
		return data!;
	});

	spawn(host: Entity, props: Props, channel: IChannel) {
		const backboard = new Entity();
		backboard.setParent(host);

		const backboardTransform = host.getComponent(Transform);

		// Taken from blender file of the model
		enum BackBoardDimensions {
			dimensionX = 1000,
			dimensionY = 1000,
			dimensionZ = 20,
		}

		enum ChangedBackboardTransform {
			dimensionX = BackBoardDimensions.dimensionX * backboardTransform.scale.x,
			dimensionY = BackBoardDimensions.dimensionY * backboardTransform.scale.y,
			dimensionZ = BackBoardDimensions.dimensionZ * backboardTransform.scale.z,
		}

		// create material for the back of the billboard
		const backMaterial = new Material();
		backMaterial.albedoColor = Color3.Gray();
		backMaterial.metallic = 0.9;
		backMaterial.roughness = 0.1;

		backboard.addComponent(new GLTFShape("dcl-billboard/models/cube_with_collider.glb")); // #VX!-absolute_path

		if (props.auto_rotate) {
			const rotate = new RotateSystem(host);
			engine.addSystem(rotate);
		}
		const link = new VersadexLink(
			new Vector3(-0.375, 0.05, 0.51),
			Quaternion.Euler(0, 180, 180),
			backboard
		);
		const link2 = new VersadexLink(
			new Vector3(0.375, 0.05, -0.51),
			Quaternion.Euler(0, 0, 180),
			backboard
		);
		const link3 = new VersadexLink(
			new Vector3(0.51, 0.05, 0.375),
			Quaternion.Euler(0, 270, 180),
			backboard
		);
		const link4 = new VersadexLink(
			new Vector3(-0.51, 0.05, -0.375),
			Quaternion.Euler(0, 90, 180),
			backboard
		);

		// create the papers which displays the creative
		const paper = new VersadexPaper(
			new Vector3(0, 0.5, 0.501),
			Quaternion.Euler(0, 180, 180),
			backboard
		);
		const paper2 = new VersadexPaper(
			new Vector3(0, 0.5, -0.501),
			Quaternion.Euler(0, 0, 180),
			backboard
		);
		const paper3 = new VersadexPaper(
			new Vector3(+0.501, 0.5, 0),
			Quaternion.Euler(0, 270, 180),
			backboard
		);
		const paper4 = new VersadexPaper(
			new Vector3(-0.501, 0.5, 0),
			Quaternion.Euler(0, 90, 180),
			backboard
		);
		const myMaterial = new Material();

		let paperScales = paper.getComponent(Transform).scale;

		enum PaperSize {
			dimensionX = Math.floor(
				paperScales.x * ChangedBackboardTransform.dimensionX
			),
			dimensionY = Math.floor(
				paperScales.y * ChangedBackboardTransform.dimensionY
			),
			dimensionZ = Math.floor(
				paperScales.z * ChangedBackboardTransform.dimensionZ
			),
		}

		let backendCall =
			baseURL +
			"/c/u/" +
			props.id +
			"/gc/?x=" +
			PaperSize.dimensionX +
			"&y=" +
			PaperSize.dimensionY +
			"&creative_type=img" +
			"&viewer=";

		try {
			executeTask(async () => {
				let response = await fetch(
					backendCall +
						(
							await this.userData
						).userId +
						"&client_identifier=" +
						identifier
				);
				let json = await response.json();

				const myTexture = new Texture(json.creative_url, { wrap: 1 });
				myMaterial.albedoTexture = myTexture;
				for (let item of [paper, paper2, paper3, paper4]) {
					item.addComponent(myMaterial);
					item.addComponent(
						new OnPointerDown(
							() => {
								openExternalURL(json.landing_url);
							},
							{ hoverText: "Visit website", distance: 800 }
						)
					);
				}
				// set campaign ID
				const billboardTransform = host.getComponent(Transform);
				const impression = new VersadexImpression(
					props.id,
					json.id,
					billboardTransform,
					identifier,
					json.impression_id
				);
				engine.addSystem(impression);
			});
		} catch {
			log("failed to reach URL");
		}
	}
}
