export class PortalUI {

    canvas: UICanvas

    background_container: UIContainerRect
    background: UIImage

    buttons_container: UIContainerRect
    button_accept: UIImage
    button_close: UIImage
    button_cancel: UIImage

    accept_callback: Function
    close_callback: Function
    cancel_callback: Function

    inputE: any
    inputF: any


    tipBg: UIContainerRect
    tipText: UIText

    private static instanceRef: PortalUI


    private constructor() {
        this.canvas = new UICanvas()
        this.setBackground()
        this.setButtons()
    }

    static instance(): PortalUI { return this.instanceRef || (this.instanceRef = new this()); }

    setEInput(bEnable: boolean) {
        var self = this
        if (!bEnable) this.inputE()
        else {
            this.inputE = Input.instance.subscribe("BUTTON_DOWN", ActionButton.PRIMARY, false, () => {
                log("Accept callback not set")
                self.show(false);
                if (self.accept_callback) self.accept_callback()
            })
        }
    }

    setFInput(bEnable: boolean) {
        var self = this
        if (!bEnable) this.inputF()
        else {
            this.inputF = Input.instance.subscribe("BUTTON_DOWN", ActionButton.SECONDARY, false, () => {
                log("Close callback not set")
                self.show(false);
                if (self.close_callback) self.close_callback()
            })
        }
    }


    setBackground() {

        this.background_container = new UIContainerRect(this.canvas)
        this.background_container.width = "100%"
        this.background_container.height = "100%"
        this.background_container.positionY = "0%"
        this.background_container.positionX = "0%"
        this.background_container.visible = false
        //this.background_container.color = Color4.Black()

        this.background = new UIImage(this.background_container, new Texture("images/pride-portal/teleportui/Background.png"))
        this.background.sourceWidth = 750
        this.background.sourceHeight = 580
        this.background.width = 750 * 0.7
        this.background.height = 580 * 0.7
        this.background.positionX = 0
        this.background.positionY = 0
        this.background.visible = true
        this.background.vAlign = "center"
        this.background.hAlign = "center"
    }

    setButtons() {
        this.buttons_container = new UIContainerRect(this.background_container)
        this.buttons_container.width = "100%"
        this.buttons_container.height = "100%"
        this.buttons_container.positionY = "0%"
        this.buttons_container.positionX = "0%"
        this.buttons_container.visible = false
        //this.buttons_container.color = Color4.Black()
        this.buttons_container.isPointerBlocker = true

        this.button_accept = new UIImage(this.buttons_container, new Texture("images/pride-portal/teleportui/accept.png"))
        this.button_accept.sourceWidth = 215
        this.button_accept.sourceHeight = 80
        this.button_accept.width = 215 * 0.7
        this.button_accept.height = 80 * 0.7
        this.button_accept.positionX = -80
        this.button_accept.positionY = -80
        this.button_accept.visible = true
        this.button_accept.vAlign = "center"
        this.button_accept.hAlign = "center"
        this.button_accept.isPointerBlocker = true

        this.setAcceptButtonOnClick()

        this.button_cancel = new UIImage(this.buttons_container, new Texture("images/pride-portal/teleportui/cancel.png"))
        this.button_cancel.sourceWidth = 30
        this.button_cancel.sourceHeight = 29
        this.button_cancel.width = 30 * 1
        this.button_cancel.height = 29 * 1
        this.button_cancel.positionX = 215
        this.button_cancel.positionY = 100
        this.button_cancel.visible = true
        this.button_cancel.vAlign = "center"
        this.button_cancel.hAlign = "center"
        this.button_cancel.isPointerBlocker = true

        this.setCancelButtonOnClick()

        this.button_close = new UIImage(this.buttons_container, new Texture("images/pride-portal/teleportui/close.png"))
        this.button_close.sourceWidth = 215
        this.button_close.sourceHeight = 80
        this.button_close.width = 215 * 0.7
        this.button_close.height = 80 * 0.7
        this.button_close.positionX = 80
        this.button_close.positionY = -80
        this.button_close.visible = true
        this.button_close.vAlign = "center"
        this.button_close.hAlign = "center"
        this.button_close.isPointerBlocker = true

        this.setCloseButtonOnClick()

        this.tipBg = new UIContainerRect(this.canvas)
        this.tipBg.width = 410
        this.tipBg.height = 40
        this.tipBg.positionX = 0
        this.tipBg.positionY = 60
        this.tipBg.visible = true
        this.tipBg.vAlign = "top"
        this.tipBg.hAlign = "center"
        this.tipBg.isPointerBlocker = false
        this.tipBg.color = Color4.Black()
        this.tipBg.opacity = 0.8

        this.tipText = new UIText(this.tipBg)
        this.tipText.value = "<b>Press right-click on your mouse to see the cursor</b>"
        this.tipText.width = 420
        this.tipText.height = 50
        this.tipText.fontSize = 14
        this.tipText.color = Color4.White()
        this.tipText.hTextAlign = "center"
        this.tipText.vTextAlign = "center"
        this.tipText.textWrapping = true

    }


    /**
     * This function sets the onClick event for a button and subscribes to a button down event to hide a
     * dialog and execute an accept callback function.
     */
    setAcceptButtonOnClick() {
        var self = this
        this.button_accept.onClick = new OnPointerDown(() => {
            self.show(false);
            if (self.accept_callback) self.accept_callback()
        })
    }

    setCancelButtonOnClick() {
        var self = this
        this.button_cancel.onClick = new OnPointerDown(() => {
            self.show(false);
            if (this.cancel_callback) self.cancel_callback()
        })
    }

    setCloseButtonOnClick() {
        var self = this
        this.button_close.onClick = new OnPointerDown(() => {
            self.show(false);
            if (self.close_callback) self.close_callback()
        })
    }

    setAcceptButtonCallback(callback: () => void) {
        this.accept_callback = () => {
            callback()
        }
    }

    setCancelButtonCallback(callback: () => void) {
        this.cancel_callback = () => {
            callback()
        }
    }

    setCloseButtonCallback(callback: () => void) {
        this.close_callback = () => {
            callback()
        }
    }

    show(bShow: boolean) {
        if (bShow == false) {
            this.setEInput(false)
            this.setFInput(false)
        }
        if (bShow == true) {
            this.setEInput(true)
            this.setFInput(true)
        }
        this.background_container.visible = bShow
        this.buttons_container.visible = bShow
        this.tipBg.visible = bShow
    }

    showTeleportToLand(callback: () => void) {
        this.setAcceptButtonCallback(() => {
            callback()
        })
        this.show(true)
    }

}