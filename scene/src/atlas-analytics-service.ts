import { getEntityWorldPosition, Interval } from "@dcl/ecs-scene-utils";
import {
	getCurrentRealm,
	getPlatform,
	Platform,
} from "@decentraland/EnvironmentAPI";
import { getUserData } from "@decentraland/Identity";
import { signedFetch } from "@decentraland/SignedFetch";
import { getParcel } from "@decentraland/ParcelIdentity";

const branchName: string = "Main Branch"; // use a unique name to differentiate different deployments or instances
const pollingInterval: number = 20000; // miliseconds
const debug: boolean = true; // activates/deactivates priting debug messages to console

@Component("atlasAnalyticsFlag")
export class AtlasAnalyticsFlag {}

interface EventData {
	eventName: string;
	player: string;
	guest: boolean;
	playerPosition: Vector3;
	playerRotation: Vector3;
	realm: string | undefined;
	timestamp: number;
	data?: OptionalData;
	sceneName?: string;
	sceneBranch?: string;
}

interface OptionalData {
	buttonPosition?: Vector3;
	cameraState?: number;
	expression?: string;
	clickedPlayer?: string;
	locked?: boolean;
	idle?: boolean;
	version?: number;
	videoData?: any;
	sceneInitData?: SceneInitData;
	playerName?: string | undefined;
	birthday?: Birthday;
}

interface Birthday {
	month: number;
	day: number;
	year: number;
}

interface SceneInitData {
	platform: Platform;
	startTime: number;
	endTime: number;
	analyticsVersion: string;
	parcels: string[];
	tags: string[];
	pollingInterval: number;
}

export class AtlasAnalyticsService extends Entity {
	pingPeriod: number;
	shape?: GLTFShape;
	apiURL: string;
	timeDelayEntity!: Entity;
	startTime: Date;
	endTime!: Date;
	debug: boolean;

	analayticsVersion: string = "0.4.3";

	sceneName?: string;
	sceneBranch: string;
	player!: string;
	playerName!: string;
	guest!: boolean;
	platform!: Platform;
	realm?: string;
	parcels!: string[];
	tags!: string[];

	constructor(
		sceneBranch: string,
		pingPeriod: number = 5000,
		debug: boolean = false
	) {
		super();
		this.startTime = new Date();
		this.pingPeriod = pingPeriod;
		this.initializePlayerData();
		this.sceneBranch = sceneBranch;
		this.enableSceneTimer();
		this.addComponent(new AtlasAnalyticsFlag());

		this.debug = debug;

		this.apiURL = "https://analytics.atlascorp.io/";
		//this.apiURL = "https://data-dapp-dev.atlascorp.io/";
		// this.apiURL = "http://localhost:8080/check-validity";

		this.timeDelayEntity = new Entity();
		engine.addEntity(this.timeDelayEntity);

		this.initializeAnalytics();
	}

	private async initializePlayerData() {
		await this.updateUserData();
		await this.updateSceneMetadata();

		this.platform = await getPlatform();

		const playerRealm = await getCurrentRealm();
		this.realm = playerRealm?.displayName;
	}

	public updateBranchName(name: string) {
		this.sceneBranch = name;
	}

	private async updateSceneMetadata() {
		try {
			let parcel = await getParcel();
			this.sceneName = parcel.land.sceneJsonData.display?.title;
			this.parcels = parcel.land.sceneJsonData.scene.parcels;
			this.tags = parcel.land.sceneJsonData.tags!;
		} catch {
			log("failed to get parcel data");
		}
		this.sceneName = "GolfCraft minigolf";
		this.parcels = [
			"47,-46","48,-46","49,-46",
			"47,-45","48,-45","49,-45",
			"47,-44","48,-44","49,-44",
			"47,-43","48,-43","49,-43"
		];
		this.tags = ["atlas:*"];
	}

	private async updateUserData() {
		let userData = await getUserData();
		log(userData);
		this.player = userData!.userId;
		this.guest = !userData?.hasConnectedWeb3;
		this.playerName = userData!.displayName;
	}

	private initializeAnalytics() {
		if (this.pingPeriod != 0 && this.pingPeriod >= 2000) {
			this.enablePing(this.pingPeriod);
		} else if (this.debug) {
			log("Ping Disabled:", this.pingPeriod);
		}
		this.enableRealmChange();
		this.enableEntersOrLeavesScene();
		this.enablePlayerChangesCameraMode();
		this.enablePlayerAnimation();
		this.enablePlayerClickPlayer();
		this.enablePlayerLocked();
		this.enableIdle();
		this.enableProfileChange();
	}

	public async submitButtonEvent(name: string, button: Entity) {
		const buttonPosition = getEntityWorldPosition(button);
		const postBody = await this.getPostBody(name, {
			buttonPosition: buttonPosition,
		});

		if (this.debug) log(postBody);
		this.submitSignedFetch(postBody);
	}

	public async submitBirthdayEvent(name: string, birthday: Birthday) {
		const postBody = await this.getPostBody(name, {
			birthday: birthday,
		});

		if (this.debug) log(postBody);
		this.submitSignedFetch(postBody);
	}

	public async submitGenericEvent(name: string) {
		const postBody = await this.getPostBody(name, {});
		if (this.debug) log(postBody);
		this.submitSignedFetch(postBody);
	}

	public async enablePing(interval: number) {
		this.timeDelayEntity.addComponent(
			new Interval(interval, async () => {
				const postBody = await this.getPostBody("ping");
				if (this.debug) log("yeet", postBody);
				this.submitSignedFetch(postBody);
			})
		);
	}

	public async enableEntersOrLeavesScene() {
		onEnterSceneObservable.add(async (player) => {
			const myPlayer = await getUserData();

			if (myPlayer?.userId === player.userId) {
				const postBody = await this.getPostBody("enters-scene");
				this.submitSignedFetch(postBody);
				if (this.debug) log(postBody);
			}
		});

		onLeaveSceneObservable.add(async (player) => {
			const myPlayer = await getUserData();
			if (myPlayer?.userId === player.userId) {
				const postBody = await this.getPostBody("leaves-scene");
				this.submitSignedFetch(postBody);
				if (this.debug) log(postBody);
			}
		});
	}

	public async enablePlayerChangesCameraMode() {
		onCameraModeChangedObservable.add(async ({ cameraMode }) => {
			const postBody = await this.getPostBody("camera-change", {
				cameraState: cameraMode,
			});
			this.submitSignedFetch(postBody);
			if (this.debug) log(postBody);
		});
	}

	public async enablePlayerAnimation() {
		onPlayerExpressionObservable.add(async ({ expressionId }) => {
			const postBody = await this.getPostBody("player-animation", {
				expression: expressionId,
			});
			this.submitSignedFetch(postBody);
			if (this.debug) log(postBody);
		});
	}

	public async enablePlayerClickPlayer() {
		onPlayerClickedObservable.add(async (clickEvent) => {
			const postBody = await this.getPostBody("player-click", {
				clickedPlayer: clickEvent.userId,
			});
			this.submitSignedFetch(postBody);
			if (this.debug) log(postBody);
		});
	}

	public async enablePlayerLocked() {
		onPointerLockedStateChange.add(async ({ locked }) => {
			const postBody = await this.getPostBody("locked-view", {
				locked: locked!,
			});
			this.submitSignedFetch(postBody);
			if (this.debug) log(postBody);
		});
	}

	public async enableIdle() {
		onIdleStateChangedObservable.add(async ({ isIdle }) => {
			const postBody = await this.getPostBody("idle", { idle: isIdle });
			this.submitSignedFetch(postBody);
			if (this.debug) log(postBody);
		});
	}

	public async enableProfileChange() {
		onProfileChanged.add(async (profileData) => {
			await this.updateUserData();
			const postBody = await this.getPostBody("profile-change", {
				version: profileData.version,
				playerName: this.playerName,
			});
			this.submitSignedFetch(postBody);
			if (this.debug) log(postBody);
		});
	}

	public async enableSceneTimer() {
		onSceneReadyObservable.add(async () => {
			this.endTime = new Date();

			const postBody = await this.getPostBody("load-timer", {
				playerName: this.playerName,
				sceneInitData: {
					platform: this.platform,
					startTime: this.startTime.getTime(),
					endTime: this.endTime.getTime(),
					analyticsVersion: this.analayticsVersion,
					parcels: this.parcels,
					tags: this.tags,
					pollingInterval: this.pingPeriod,
				},
			});

			this.submitSignedFetch(postBody);

			if (this.debug) log(postBody);
		});
	}

	public async enableVideo() {
		onVideoEvent.add(async (data) => {
			const postBody = await this.getPostBody("video", {
				videoData: data,
			});
			this.submitSignedFetch(postBody);
			log(postBody);
		});
	}

	public async enableRealmChange() {
		onRealmChangedObservable.add(async (realmChange) => {
			this.realm = realmChange.displayName;
		});
	}

	private async assemblePlayerData() {
		const playerWorldPosition = Camera.instance.worldPosition;
		const playerRotation = Camera.instance.rotation.eulerAngles;

		return {
			player: this.player,
			guest: this.guest,
			playerPosition: playerWorldPosition,
			playerRotation: playerRotation,
			realm: this.realm,
			sceneName: this.sceneName,
			sceneBranch: this.sceneBranch,
			timestamp: new Date().getTime(),
		};
	}

	private async getPostBody(
		eventName: string,
		data?: OptionalData
	): Promise<EventData> {
		const result = await this.assemblePlayerData();

		return {
			...result,
			eventName: eventName,
			data,
		};
	}

	private async submitSignedFetch(postBody: EventData) {
		return;
		try {
			let response = await signedFetch(this.apiURL, {
				headers: {
					"Content-Type": "application/json",
					"User-Agent": "AtlasCorp",
					"Cache-Control": "no-cache",
				},
				method: "POST",
				body: JSON.stringify(postBody),
			});
			// let json = await response.json();
			if (this.debug) log(response);
		} catch {
			if (this.debug) log("failed to reach analytics URL");
		}
	}
}

export const atlasAnalytics = new AtlasAnalyticsService(
	branchName,
	pollingInterval,
	debug
);

/************************
* 		Change Log		*
*************************

0.4.3

- Added function to change scene branch name after analtyics entity is created
- Addded AtlasAnalyticsFlag custom component to identify entity in cases of scene wiping for instancing
- Updated verison number
- Added comments to 3 branch name, polling interval, and debug  
*/
