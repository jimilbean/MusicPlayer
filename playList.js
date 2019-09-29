class PlayList {
    constructor(el, app){
        this.app = app;
        this.listDom = document.querySelector(el);
        this.itemList = this.listDom.querySelector(".item-list");
        this.addBtn = this.listDom.querySelector("#openDialog");
        this.fileInput = this.listDom.querySelector("#audioFile");
 
        this.itemList.innerHTML = "";
        this.fileList = []; //플레이리스트 상에 있는 음악파일들을 저장
        this.playIdx = null; //현재 재생중인 음악의 인덱스를 저장

        this.currentMusic = null;

        this.contextMenu = document.querySelector("#context");
        this.contextTargetItem = null;


        this.del = document.querySelector("#del");

        this.addListener();
    }

    addListener(){
        this.addBtn.addEventListener("click", e => this.fileInput.click());
        this.fileInput.addEventListener("change", this.inputChange.bind(this));

        this.listDom.addEventListener("dragover", this.fileDragOver.bind(this));
        this.listDom.addEventListener("drop", this.fileDrop.bind(this));


        this.contextMenu.querySelector("#del").addEventListener("click", (e)=>{
            console.log(this.contextTargetItem);
            let item = this.listDom.querySelector(".item-list").childNodes[this.contextTargetItem.idx];
            console.log(item);
            // item.remove();
            item.style.display = 'none';
            this.contextMenu.style.display = "none";
            this.app.player.playable= false;
            this.app.player.audio.pause();
            this.app.player.currentSpan.innerHTML = '00:00:00';
            this.app.player.totalSpan.innerHTML = '00:00:00';
            this.app.player.fileName.innerHTML = '';
            this.app.player.progressBar.style.width = 0;
            this.app.player.ctx.clearRect(0, 0, this.app.player.canvas.width, this.app.player.canvas.height);
            e.stopPropagation();
        });

        document.querySelector("body").addEventListener("click", (e)=> {
            this.contextMenu.style.visibility = "hidden";
            this.contextTargetItem = null;
        });
    }

    fileDragOver(e){
        e.preventDefault();
        e.stopPropagation();
    }

    fileDrop(e){
        e.preventDefault();
        e.stopPropagation();
        let files = Array.from(e.dataTransfer.files);
        this.addList(files);

    }

    inputChange(e){
        let files = Array.from(e.target.files);
        this.addList(files);

    }



    addList(files) {
        files.forEach(file => {
            if(file.type.substring(0, 5) !== "audio") return;
            let obj = {idx: this.fileList.length, file: file, dom: null};
            this.fileList.push(obj);
            let item = document.createElement("li");
            item.classList.add("item");
            obj.dom = item;
            item.addEventListener("dblclick", (e) => {
                let data = this.fileList.find(x => x.idx == obj.idx);
                this.playItem(data);
            });

            item.addEventListener("contextmenu", (e)=> {
                e.preventDefault();
                e.stopPropagation();
                this.contextTargetItem = obj;
                this.contextMenu.style.top = e.pageY + "px";
                this.contextMenu.style.left = e.pageX + "px";
                this.contextMenu.style.visibility = "visible";
                this.contextMenu.style.display = "block";
            });


            

            item.innerHTML = file.name;
            this.itemList.appendChild(item);
        });
    }

    playItem(data){
        this.fileList.forEach(file => {
            file.dom.classList.remove("active");
        });

        this.currentMusic = data.idx;  //현재 재생중인 음악의 idx를 저장

        data.dom.classList.add("active");
        this.app.player.loadMusic(data.file);
    }

    getNextMusic(loop){
        let now = this.fileList.findIndex(x => x.idx == this.currentMusic);
        if(now < this.fileList.length - 1){
            this.playItem(this.fileList[now + 1]);
        }else if(loop){
            this.playItem(this.fileList[0]);
        }
    }
}