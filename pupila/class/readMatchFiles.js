class NWarraySports {
    
    constructor () {};

    static #data = undefined;
    static #memory = [];
    static #matchToCatch = [];

    static setData(data) {
        this.#data = data[0]["value"]
    }

    static set setMemory(memory) {
        this.#memory = memory
    }

    static set setMatchToCatch(mm) {
        this.memory = mm
    }
    
    
    static get getData() {
        return this.#data
    }

    static get getMemory() {
        return this.#memory
    }

    static get getMatchToCatch() {
        return this.#matchToCatch
    }

    static setMemory(memory) {

        this.#memory = memory;

    }

    static compare() {
        
        // Compare memory vs data
        for (let a in this.#data) {

            if (!this.#memory.includes(this.#data[a])) {                
                this.#memory.push(this.#data[a])
                this.#matchToCatch.push(this.#data[a])
            }
        }

        // remove items from memory if data does´not contain them
        let newArray = []
        for (let i in this.#memory) {

            if (this.#data.includes(this.#memory[i])) {
                newArray.push(this.#memory[i])                
            }
        }        
        this.setMemory(newArray);
    }

    static clearMatchToCatch() {

        this.#matchToCatch = []

    }    

    static deleteOfMemory(mathcidsc) {

        function rmMatchIdSc(el) {
            return el == mathcidsc
        }

        let newMemory = this.#memory.filter(rmMatchIdSc)

        this.setMemory(newMemory);    


    }
}

module.exports = NWarraySports







