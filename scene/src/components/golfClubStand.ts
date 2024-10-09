export const createGolfClubStand = (parent, {src, position, rotation}) => {
    const entity = new Entity();
    const shape = new GLTFShape(src);
    entity.setParent(parent);
    entity.addComponent(new Transform({
        position,
        rotation
    }));
    entity.addComponent(shape)
}