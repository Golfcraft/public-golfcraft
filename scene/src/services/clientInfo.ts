const getClientInfo = async (api) => {
    const user = api.getUserData? (await api.getUserData()) : api.user.data;
    const realm = api.getCurrentRealm? (await api.getCurrentRealm()).displayName: api.server.realm.displayName; 
    return [user, realm];
}

export {
    getClientInfo
};