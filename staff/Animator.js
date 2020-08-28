import dynamics from "dynamics.js"

class Animator
{
    constructor() {
        this.objects = []
        this.enable = 1
        window.addEventListener('blur', () => {
            //this.enable = 0
        })
        window.addEventListener('focus', () => {
            //this.enable = 1
        })
    }

    animateProperty(object, properties, options = [])
    {
        if(!this.enable)
        {
            Object.keys(properties).forEach((name) => {
                object[name] = properties[name]
            })
            return;
        }

        this.objects.push(object)

        Object.keys(properties).forEach((name) => {
            object[name + 'Goal'] = properties[name]
        })
        dynamics.animate(object, properties, {
            ...options,
            change: () => {
                if(options.change) options.change()
                //console.log(object)
            },
            complete: () => {
                if(options.complete) options.complete()

                /*Object.keys(properties).forEach((name) => {
                    delete object[name + 'Goal']
                })*/
            },
            type: dynamics.linear
        })
    }

    stopPropertyAnimation(property)
    {
        dynamics.stop(property)
    }

    destroy() {
        this.objects.forEach(item => {
            dynamics.stop(item)
        })
    }
}


export default Animator
