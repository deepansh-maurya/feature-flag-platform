export default class Observer {

    private static data?: any = {}

    private static listeners: Record<string, (...args: any[]) => void> = {}

    static add(name: string, cb: (...args: any[]) => void) {
        this.listeners[name] = cb
    }

    static remove(name: string) {
        delete this.listeners[name]
    }

    private static call(data:any) {
        Object.keys(this.listeners).forEach((name) => {
            const cb = this.listeners[name]
            try {
                cb && cb(data)
            } catch (error) {

            }
        })
    }

    static seData(obj: any) {
        this.data = { ...this.data, ...obj }
        this.call(this.data)
    }

}