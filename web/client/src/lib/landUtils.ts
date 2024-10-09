const marketApi = `https://api.decentraland.org/v1`;

export const isParcel = (landData) => ~landData?.id?.indexOf(",");
export const isEstate = (landData) => !isParcel(landData);

const defaultLandImageURLRequestOptions = {width:150, height:150};

export const getLandImageURL = (landData, { width, height }=defaultLandImageURLRequestOptions) => {
    return isParcel(landData)
    ? `${marketApi}/parcels/${landData.x}/${landData.y}/map.png?width=${width}&height=${height}`
    : `${marketApi}/estates/${landData.id}/map.png?width=${width}&height=${height}`;
}