//Класс отслеживающий события на псевдо-элементах канваса
class CanvasEvents {
    constructor(canvas) {
        this.Canvas = canvas
        this.emiters = {}

        this.listeners = {}
        this.bindMouseEvents()
    }

    addEmiter(objectName, isInObjectArea) {
        this.emiters[objectName] = {
            mouseover: 0,
            inArea: isInObjectArea
        }

        return this
    }

    emit(eventName, eventInfo) {
        let e = new Event(eventName, {
            bubbles: false,
            cancelable: false
        })
        e.originalEvent = eventInfo
        this.Canvas.canvas.dispatchEvent(e)

        return;

        if (!this.listeners[eventName]) return;
        this.listeners[eventName].forEach((listener) => {
            listener({
                eventName: eventName,
                originalEvent: eventInfo
            })
        })
    }

    bindMouseEvents() {
        this.bindMouseDown()
        this.bindMouseMove()
        this.bindMouseUp()
        this.bindMouseOver()
        this.bindMouseOut()
        this.bindMouseWheel()
    }


    bindMouseDown() {
        let handler = (e) => {
            this.detectObjects(e.offsetX, e.offsetY).forEach((emiterName) => {
                this.emit(emiterName + ':' + e.type, e)
            })
        }

        this.Canvas.canvas.addEventListener('mousedown', handler)
        this.Canvas.canvas.addEventListener('pointerdown', handler)
    }

    bindMouseMove() {
        let handler = (e) => {

            let eventTypePrefix = 'mouse'
            if (/pointer/.test(e.type)) {
                eventTypePrefix = 'pointer'
            }

            let detectedEmiters = this.detectObjects(e.offsetX, e.offsetY)
            detectedEmiters.forEach((emiterName) => {
                this.emit(emiterName + ':' + e.type, e)
                if (this.emiters[emiterName].mouseover == 0) {
                    this.emiters[emiterName].mouseover = 1
                    this.emit(emiterName + ':' + eventTypePrefix + 'over')
                }
            })
            //для всех элементов на которых не расположен курсор вызывается mouseover
            Object.keys(this.emiters).forEach(emiterName => {
                if (detectedEmiters.indexOf(emiterName) >= 0) return;


                if (this.emiters[emiterName].mouseover == 1) {
                    this.emiters[emiterName].mouseover = 0
                    this.emit(emiterName + ':' + eventTypePrefix + 'out')
                }
            })
        };
        //this.Canvas.canvas.addEventListener('mousemove', handler)
        this.Canvas.canvas.addEventListener('pointermove', handler)
    }

    bindMouseOver() {
        let handler = (e) => {
            let detectedEmiters = this.detectObjects(e.offsetX, e.offsetY)
            detectedEmiters.forEach((emiterName) => {
                this.emit(emiterName + ':' + e.type, e)
                this.emiters[emiterName].mouseover = 1
            })

            this.mouseOutAll(e, detectedEmiters)
        };
        //this.Canvas.canvas.addEventListener('mouseover', handler)
        this.Canvas.canvas.addEventListener('pointerover', handler)
    }

    mouseOutAll(e, except = [])
    {
        //для всех элементов на которых не расположен курсор вызывается mouseover
        Object.keys(this.emiters).forEach(emiterName => {
            if (except.indexOf(emiterName) >= 0) return;

            if (this.emiters[emiterName].mouseover == 1) {
                this.emiters[emiterName].mouseover = 0

                if (/mouse/.test(e.type)) {
                    this.emit(emiterName + ':' + 'mouseout')
                }
                if (/pointer/.test(e.type)) {
                    this.emit(emiterName + ':' + 'pointerout')
                }
            }
        })
    }

    bindMouseUp() {
        let handler = (e) => {
            this.detectObjects(e.offsetX, e.offsetY).forEach((emiterName) => {
                this.emit(emiterName + ':' + e.type, e)
            })
        }
        //this.Canvas.canvas.addEventListener('mouseup', handler)
        this.Canvas.canvas.addEventListener('pointerup', handler)
    }

    bindMouseOver() {
        let handler = (e) => {
            this.detectObjects(e.offsetX, e.offsetY).forEach((emiterName) => {
                //!!!!!!this.emit(emiterName + ':' + e.eventType, e)
                this.emit(emiterName + ':' + e.type, e)
            })
        }

        //this.Canvas.canvas.addEventListener('mouseover', handler)
        this.Canvas.canvas.addEventListener('pointerover', handler)
    }

    bindMouseOut() {
        let handler = (e) => {
            this.mouseOutAll(e)
        }
        //this.Canvas.canvas.addEventListener('mouseout', handler)
        this.Canvas.canvas.addEventListener('pointerout', handler)
    }

    bindMouseWheel() {
        let handler = (e) => {
            Object.keys(this.emiters).forEach((emiterName) => {
                this.emit(emiterName + ':' + e.type, e)
            })
        }

        //this.Canvas.canvas.addEventListener('mousewheel', handler)
        this.Canvas.canvas.addEventListener('wheel', handler)
    }

    detectObjects(x, y) {
        let detected = []
        Object.keys(this.emiters).forEach((i) => {
            if (this.emiters[i].inArea(x, y)) {
                detected.push(i)
            }
        })
        return detected
    }
}

export default CanvasEvents
