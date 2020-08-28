import * as Utils from "../staff/utils.js"
import Component from "./Component"

//Отвечает за отрисовку сайдбара, сместе с просчетом позиций отрисовки надписей о цене
class Sidebar extends Component {
    constructor(config, range, canvas, $root) {
        super();

        this.config = config
        this.range = range
        this.Canvas = canvas
        this.$root = $root



        this._labelPositions = []
        this.calcRenderLabels()

        this.bindScale()
        //поставить события слушающее изменение range, при срабатывании вызывающее this.calcRenderLabels()
    }

    calcRenderLabels() {
        this.labelPositions.length = 0

        let fromPrice = this.range.from
        let toPrice = this.range.to

        let formatter = (price) => (price.toFixed(6) + '$');


        let labelHeight = this.config.fontSize * 3.5
        let maxCount = Math.ceil((this.$root.getY(fromPrice) - this.$root.getY(toPrice)) / labelHeight)
        let step = (toPrice - fromPrice) / maxCount

        let y = 100;


        let bottomPrice = this.$root.getPrice(this.config.height)
        for (let i = bottomPrice - bottomPrice % step; i <= (toPrice + step) || y > 0; i += step) {
            y = this.$root.getY(i)
            let priceFormatted = formatter(i)

            if(y > this.$root.config.area.height) continue;

            this.labelPositions.push({
                y: y,
                price: priceFormatted
            })
        }
    }

    bindScale() {
        let backMouseX, backMouseY;
        let mousepressed = 0

        this.Canvas.canvas.addEventListener('sidebar:pointerdown', (e) => {
            mousepressed = 1
            document.documentElement.style.cursor = "n-resize";
        })

        document.addEventListener('pointermove', (e) => {

            if (mousepressed && backMouseX && backMouseY) {
                //насколько переместился курсор по сравнению с прежним срабатыванием
                let moveX = (e.clientX - backMouseX) / this.$root.config.area.width
                let moveY = (e.clientY - backMouseY) / this.$root.config.area.height

                console.log(moveY, this.config.height, moveY / this.config.height * 100000)
                let newPaddingFrom = this.range.paddingFrom + (moveY / this.config.height * 10000)
                let newPaddingTo = this.range.paddingTo + (moveY / this.config.height * 10000)

                if(newPaddingFrom < 0 || newPaddingFrom + newPaddingTo >= this.$root.config.area.height) return;

                document.documentElement.style.cursor = "n-resize";

                this.range.paddingFrom = newPaddingFrom
                this.range.paddingTo = newPaddingTo


                this.$root.Sidebar.calcRenderLabels()
                this.$root.Timeline.calcRenderLabels()

                //this.$root.render()
            }

            backMouseX = e.clientX
            backMouseY = e.clientY
        })

        document.addEventListener('pointerup', function(e) {
            document.documentElement.style.cursor = "default";
            mousepressed = 0
        })
        /*
        document.addEventListener('pointerout', function(e) {
            document.documentElement.style.cursor = "default";
            mousepressed = 0
        })*/
    }

    render() {
        this.ctx.strokeStyle = "rgba(1,1,1,0.9)"
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle"
        this.ctx.font = this.$root.config.fontSize + 'px Arial'

        this.drawBase()
        //this.drawBorder()

        //console.log(this.labelPositions)

        let x = this.config.width / 2 + this.config.x // x - базовая линия вывода подписей
        this.labelPositions.forEach((curr) => {
            this.drawLabelBase(x, curr.y, curr.price, this.ctx.font)
            this.drawLabel(x, curr.y, curr.price) // x -позиция где писать метку времени, i - сама метка времени в unix
            this.drawLabelTrait(x, curr.y, curr.price)
        })
    }

    drawBase() {
        this.ctx.fillStyle = this.config.backgroundColor
        this.ctx.fillRect(this.config.x, this.config.y, this.config.width, this.config.height)
    }

    drawBorder() {
        return
        this.ctx.strokeStyle = "rgba(255,255,255,0.05)"
        this.ctx.beginPath()
        this.ctx.moveTo(this.config.x, 0)
        this.ctx.lineTo(this.config.x, this.config.height)
        this.ctx.stroke()
    }

    drawLabel(x, y, text) {
        this.ctx.fillStyle = this.config.textColor
        this.ctx.fillText(text, x, y);
    }

    drawLabelBase(x, y, text, font) {
        let w = Utils.getTextWidth(text, font) + 14
        let h = parseInt(font) * 2
        let r = 3
        x -= w / 2
        y -= h / 2

        this.ctx.fillStyle = '#202434'
        this.ctx.strokeStyle = '#26364f'
        this.ctx.roundRect(x,y,w,h,r);
        this.ctx.fill()
        this.ctx.stroke()
    }

    drawLabelTrait(x, y, text) {
        this.ctx.strokeStyle = "rgba(255,255,255,0.05)"
        this.ctx.beginPath()
        this.ctx.moveTo(this.config.x, y)
        this.ctx.lineTo(this.config.x + (this.config.width - Utils.getTextWidth(text)) / 5, y)
        this.ctx.stroke()
    }


    formatter(price) {
        return price.toFixed(2)
    }

    get labelPositions() {
        return this._labelPositions
    }
}

export default Sidebar
