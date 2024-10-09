
//with limit 'https://events.decentraland.org/api/events/?limit=10'
//without limit 'https://events.decentraland.org/api/events/'

import { Companies_Events } from "./preSetEventData"
/**
 *  Gets the events from the api
 * @param url 
 * @returns 
 */
export async function getEvents(url: string) {
  let events: any[] = []

  try {
    const response = await fetch(url)
    const json = await response.json()


    for (const event of json.data) {
      events.push(event)

    }
    //! test if events is empty
    if (!events[0]) {
      events = []
      Companies_Events.forEach(event => {
        events.push(event)
      });
      return events
    }

    return events
  } catch (e) {
    log('error getting event data ', e)
    events = []
    Companies_Events.forEach(event => {
      events.push(event)
    });
  }
}




