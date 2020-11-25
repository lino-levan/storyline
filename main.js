class game {
    constructor(){
        this.default_option = '...'
    }

    async get_story(file_path) {
        let that = this

        var rawFile = new XMLHttpRequest();
        rawFile.open("GET", file_path);
        rawFile.onreadystatechange = function ()
        {
            if(rawFile.readyState === 4)
            {
                if(rawFile.status === 200 || rawFile.status == 0)
                {
                    var allText = rawFile.responseText;

                    var parts = {}

                    let on = ""

                    allText.split("\n").forEach((line, i)=>{
                        if(line.match(/<--.+-->/gm)) {
                            parts[line.split("<--")[1].split("-->")[0]] = new Array(i+1).fill("")
                            on = line.split("<--")[1].split("-->")[0]
                        } else {
                            parts[on].push(line)
                        }
                    })

                    that.settings = parts.settings.filter((inp)=>inp.length>0)
                    that.storyline = parts.plot
                    that.render(3)
                }
            }
        }
        rawFile.send(null);
    }

    render(line_unparsed) {
        console.log("Rendering line "+line_unparsed)
        
        let line_num = this.get_line(line_unparsed)

        let line = this.storyline[line_num-1]
        let name = line.split("[")[1].split("]")[0]
        let question = this.parse_question(line.split("|")[0])
        let options = this.parse_options(line.split("|").slice(1))

        let story = document.getElementById("story");
        story.innerHTML = '';

        let textbox = document.createElement("div")

        textbox.innerHTML = `<img src="${this.get_setting(name)}" style="width:50px;height:50px"></img> ${name}: ${question}`

        console.log("Rendering options")

        options.forEach(option => {
            console.log("Going to line "+this.get_line(option[1].trim(), line_num)+" from option " + option[0].trim())
            textbox.innerHTML += `<button onclick="g.render(${this.get_line(option[1].trim(), line_num)})">${option[0]}</button>`
        });

        story.appendChild(textbox)

        console.log("Rendering complete!")
    }

    parse_question(question) {
        return question.split("]")[1].split("->")[0]
    }

    parse_options(options) {
        if(options.length>0){
            return options.map((option)=>{
                return option.split("->")
            })
        } else {
            return []
        }
    }

    get_setting(setting) {
        for(let i = 0;i<this.settings.length;i++) {
            let current = this.settings[i]
            if(current.split("->")[0].trim() === setting)
                return current.split("->")[1].trim()
        }
    }

    get_line(line, current) {
        if(typeof line === "number") {
            return line
        }

        if(typeof line === "string") {
            if(line.trim() === '$NEXT') {
                return current+1
            } else if(line.trim() === '$PREV') {
                return current-1
            } else if(line.trim() === '$THIS') {
                return current
            }

            if(line.trim().match(/[$]NEXT[+]\d+/gm)) {
                return current + 1 + (+line.trim().split("+")[1])
            }

            if(line.trim().match(/[$]PREV[+]\d+/gm)) {
                return current - 1 - (+line.trim().split("+")[1])
            }
        }

        if(isNaN(+line)) {
            for(let i = 0;i<this.storyline.length;i++) {
                if(this.storyline[i].trim() === line.trim()) {
                    return i+2
                }
            }
        } else {
            return +line
        }
    }
}

const g = new game()
g.get_story("story.txt")