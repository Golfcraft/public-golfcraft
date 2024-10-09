export const useAccount = () => {
    const appContext = useContext(AppContext);
    const {address, registered, emailVerified} = appContext.account;
    return {address, registered, emailVerified};
}