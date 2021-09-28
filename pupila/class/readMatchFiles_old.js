const fs = require('fs');

class NWarraySports {
    
    #data;
    #memory;
    #matchToCatch;

    constructor(data) {

        this.#data = data[0]["value"]
        this.#memory = []
        this.#matchToCatch = []
        this.datos = data //probably clear it
    }   

   

    get getData() {

        return this.#data
    }
    
    get getMemory() {
        return this.#memory
    }

    get getMatchToCatch() {
        return this.#matchToCatch
    }

    setData(data) {

        this.#data = data
    }

    setMemory(data) {

        this.#memory = data

    }
    
    compare() {
        
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
    
    clearMatchToCatch() {

        this.#matchToCatch = []

    }

}

module.exports = NWarraySports


