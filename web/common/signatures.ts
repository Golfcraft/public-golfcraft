export enum SIGN_MESSAGE {
    REGISTER_EMAIL,
    LOGIN_NONCE,
    CREATE_AD,
    RENT_REQUEST,
    ACCEPT_RENT_REQUEST,
    DELETE_AD,
    DELETE_RENT_REQUEST,
    UPDATE_AD
};

const SIGN_MESSAGE_TEMPLATE = {
    [SIGN_MESSAGE.REGISTER_EMAIL]:"Registering email $0",
    [SIGN_MESSAGE.LOGIN_NONCE]:"Login with nonce $0",
    [SIGN_MESSAGE.CREATE_AD]:"$0",
    [SIGN_MESSAGE.RENT_REQUEST]:"Rent request for Ad $0",
    [SIGN_MESSAGE.ACCEPT_RENT_REQUEST]:"Accept rent request $0",
    [SIGN_MESSAGE.DELETE_AD]:"Delete ad for entity $0",
    [SIGN_MESSAGE.DELETE_RENT_REQUEST]:"Delete rent request $0",
    [SIGN_MESSAGE.UPDATE_AD]:"Update ad for land with data $0"
};

export const getSignatureMessage = (SIGN_MESSAGE_KEY, ...params) => {
    return SIGN_MESSAGE_TEMPLATE[SIGN_MESSAGE_KEY].replace('$0', params[0]);
};

