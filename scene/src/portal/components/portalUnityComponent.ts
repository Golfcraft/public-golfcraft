import { Portal } from "../portal";
import { Companies_Events, EventPanelData } from "../preSetEventData";

@Component('PortalComponent')
export class PortalComponent {

    entity: Entity
    portal: Portal

    constructor(entity: Entity, name: string, user: any, PlayFabId: string) {
        this.entity = entity;

        let event = this.searchForEvent(name);
        if (!event) {
            log("Event not found, " + name + " creating default event")
            event = Companies_Events[0];
        }
        this.portal = new Portal(event, this.entity.getComponent(Transform), user, PlayFabId);
    }

    private searchForEvent(name: string): EventPanelData | undefined {
        let result: EventPanelData | undefined;
        Companies_Events.forEach((event: EventPanelData) => {
            if (event.scene_name == name) {
                result = event;
            }
        });
        return result;
    }

}