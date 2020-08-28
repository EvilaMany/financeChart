import * as Utils from "../staff/utils.js"
import Component from "./Component"
import moment from "moment"
moment.locale('ru')

//Отвечает за отрисовку таймлайна вместе с надписями о времени
class Timeline extends Component{
    constructor(config, range, canvas, $root)
    {
        super();

        this.config = config
        this.range = range
        this.Canvas = canvas
        this.$root = $root

        this._labelPositions = []
        this.calcRenderLabels()
    }

    calcRenderLabels()
    {
        this.labelPositions.length = 0

        let fromDate = moment(this.range.from)
        let toDate = moment(this.range.to)

        let unitName, nextUnit, startDate, formatter;
        if(toDate.diff(fromDate, 'years') >= 4)
        {
            unitName = 'year'
            formatter = (momentInst) => (moment(momentInst).format('YYYY.MMM'))
        }
        else if(toDate.diff(fromDate, 'month') >= 7)
        {
            unitName = 'month'
            formatter = (momentInst) => (moment(momentInst).format('YYYY.MMM.DD'))
        }
        else if(toDate.diff(fromDate, 'days') >= 7)
        {
            unitName = 'month'
            formatter = (momentInst) => (moment(momentInst).format('MMM.DD HH:mm'))
        }
        else if(toDate.diff(fromDate, 'hour') >= 7)
        {
            unitName = 'hour'
            formatter = (momentInst) => (moment(momentInst).format('MMM.DD HH:mm'))
        }
        else if(toDate.diff(fromDate, 'minutes') >= 7)
        {
            unitName = 'minute'
            formatter = (momentInst) => (moment(momentInst).format('HH:mm:ss'))
        }
        else//if(toDate.diff(fromDate, 'seconds') >= 0)
        {
            unitName = 'second'
            formatter = (momentInst) => (moment(momentInst).format('HH:mm:ss'))
        }

        let labelWidth = Utils.getTextWidth(formatter(fromDate), this.config.fontSize) + 20
        let maxCount = this.config.width / labelWidth
        let step = Math.ceil(toDate.diff(fromDate, unitName) / maxCount)


        let secondsInUnit = moment(0).add(1, unitName)
        let closestPoint = moment(parseInt(fromDate / (step*secondsInUnit)) * (step*secondsInUnit))


        let incToDate = moment(toDate).add(0, unitName)
        for(let i = closestPoint; i <= incToDate; i.add(step, unitName).startOf(unitName))
        {
            this.labelPositions.push({
                x: this.$root.getX(i),
                time: formatter(i)
            })
        }
    }

    render()
    {
        this.ctx.strokeStyle = "rgba(120,121,132,1)"
        this.ctx.textAlign = "center";
        this.ctx.textBaseline  = "middle"
        this.ctx.font = (this.config.fontSize || this.$root.config.fontSize) + 'px Arial'

        this.drawBase()
        //this.drawBorder()

        let y = (this.config.y + this.config.height / 2) // y - базовая линия для всех подписей
        this.labelPositions.forEach((curr) => {
            this.drawLabel(curr.x, y, curr.time) // x -позиция где писать метку времени, i - сама метка времени в unix
            this.drawLabelTrait(curr.x, y, curr.time)
        })
    }

    drawBase()
    {
        this.ctx.fillStyle = this.config.backgroundColor
        this.ctx.fillRect(this.config.x, this.config.y, this.config.width, this.config.height)
    }

    drawBorder()
    {
        this.ctx.beginPath()
        this.ctx.moveTo(0, this.config.y)
        this.ctx.lineTo(this.config.width, this.config.y)
        this.ctx.stroke()
    }

    drawLabel(x, y, text)
    {
        this.ctx.fillStyle = this.config.textColor
        this.ctx.fillText(text, x, y);
    }

    drawLabelTrait(x, y, text)
    {
        this.ctx.strokeStyle = "rgba(255,255,255,0.05)"
        this.ctx.lineWidth = 1
        this.ctx.beginPath()
        this.ctx.moveTo(x, this.config.y)
        this.ctx.lineTo(x, this.config.y + (this.config.height - this.$root.config.fontSize - 2) / 3)
        this.ctx.stroke()
    }

    get labelPositions()
    {
        return this._labelPositions
    }

    formatter(unix)
    {
        let d = new Date(unix)
        return d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds()
    }
}

export default Timeline
