export const hideAvatarInFronOf = (entity) => {
    const modArea = new Entity()
    modArea.addComponent(
        new AvatarModifierArea({
          area: { box: new Vector3(3, 4, 3) },
          modifiers: [AvatarModifiers.HIDE_AVATARS],
        })
      )
/*     const modShape = new BoxShape();
    modShape.withCollisions = false;   
    const mat = new Material();
    mat.albedoColor = new Color4(1,0,0,0.1);
    modArea.addComponent(mat);
    modArea.addComponent(modShape); */
    modArea.addComponent(
        new Transform({
            position: new Vector3(0, 0, -1),
            scale:  new Vector3(3, 4, 3) 
        })
    );
    modArea.setParent(entity);
}