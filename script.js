"use strict"

const customCursor = document.querySelector("#cursor");
const box = document.querySelectorAll(".box");
const grid = [(Array.from(box)).slice(0,3), (Array.from(box)).slice(3,6), (Array.from(box)).slice(6,9)];
const playgrid = [[-1,-1,-1], [-1,-1,-1], [-1,-1,-1]];
const winMask = [[{i:0,j:0},{i:0,j:1},{i:0,j:2}], [{i:1,j:0},{i:1,j:1},{i:1,j:2}], [{i:2,j:0},{i:2,j:1},{i:2,j:2}],
                 [{i:0,j:0},{i:1,j:0},{i:2,j:0}], [{i:0,j:1},{i:1,j:1},{i:2,j:1}], [{i:0,j:2},{i:1,j:2},{i:2,j:2}],
                 [{i:0,j:0},{i:1,j:1},{i:2,j:2}], [{i:0,j:2},{i:1,j:1},{i:2,j:0}]];
let player,comp,gameflag=-1;
const visible = {
    opacity: `100%`
}
const invisible = {
    opacity: `0`
}
const expand = {
    height: `40px`,
    width: `40px`
}
const contract = {
    height: `20px`,
    width: `20px`
}

gameSetup();

for(let i of Array.from(box)){
    i.addEventListener("mouseenter",(e)=>{
        if(gameflag!=-1){
            return;
        }
        for(let j in grid){
            for(let k in grid[j]){
                if(e.target===grid[j][k]){
                    if(playgrid[j][k]==-1){
                        document.querySelector("#cursorIndicator").animate(visible,{
                            duration: 400,
                            fill: "forwards"
                        })
                        customCursor.animate(expand,{
                            duration: 400,
                            fill: "forwards"
                        })
                    }
                }
            }
        }
    });
    i.addEventListener("mouseout",(e)=>{
        document.querySelector("#cursorIndicator").animate(invisible,{
            duration: 400,
            fill: "forwards"
        })
        customCursor.animate(contract,{
            duration: 400,
            fill: "forwards"
        })
    });
}

for(let i of Array.from(box)){
    i.addEventListener("click",(e)=>{
        if(gameflag!==-1){
            return;
        }
        for(let j in grid){
            for(let k in grid[j]){
                if(e.target===grid[j][k]){
                    if(playgrid[j][k]===-1){
                        e.target.innerHTML=(player===1)?"X":"O";
                        playgrid[j][k]=player;
                        if(hasWon(player,playgrid)){
                            gameflag=player;
                            document.querySelector(".indicator").innerHTML=("<span class=salsa> "+((player===1)?"X":"O")+"</span> WON");
                        }
                        else{
                            makeMove();
                        }
                    }
                }
            }
        }
    });
}

window.onmousemove =  e => {
    const x = e.clientX-customCursor.offsetWidth/2;
    const y = e.clientY-customCursor.offsetHeight/2;

    const move = {
        transform: `translate(${x}px,${y}px)`
    }

    customCursor.animate(move, {
        duration: 800,
        fill: "forwards"
    });
};

function gameSetup(){
    gameflag = -1;
    for(let i in playgrid){
        for(let j in playgrid[i]){
            playgrid[i][j]=-1;
        }
    }
    for(let i of Array.from(box)){
        i.innerHTML="";
    }
    comp = Math.round(Math.random());
    player = 1-comp;
    document.querySelector(".indicator").innerHTML=("YOU ARE"+"<span class=salsa> "+((player===1)?"X":"O")+"</span>");
    document.querySelector("#cursorIndicator").innerHTML=((player===1)?"X":"O");
    // console.log(playgrid);
    if(comp===1){
        makeMove();
    }
}

function hasWon(testPlayer, playgrid){
    for(let mask of winMask){
        let flag=1;
        for(let move of mask){
            // console.log(move);
            if(playgrid[move.i][move.j]!=testPlayer){
                flag=0;
                break;
            }
        }
        if(flag==0){
            continue;
        }
        return true;
    }
    return false;
}

function isDraw(playgrid){
    for(let i of playgrid){
        for(let j of i){
            if(j==-1){
                return false;
            }
        }
    }
    return true;
}

function minimax(turn,Grid){
    let testGrid=[[...Grid[0]], [...Grid[1]], [...Grid[2]]];
    if(hasWon((1-turn),testGrid)){
        return (turn==1)? -10:10;
    }
    if(hasWon(turn,testGrid)){
        return (turn==1)? 10:-10;
    }
    if(isDraw(testGrid)){
        return 0;
    }
    let newGrid;
    let score;
    let curBestScore=(turn==1)?-Infinity:Infinity;
    for(let i=0;i<3;i++){
        for(let j=0;j<3;j++){
            newGrid=[[...testGrid[0]], [...testGrid[1]], [...testGrid[2]]];
            if(newGrid[i][j]==-1){
                newGrid[i][j]=turn;
                score=minimax(1-turn, newGrid);
                if(turn==1){
                    curBestScore=Math.max(curBestScore,score);
                }
                else{
                    curBestScore=Math.min(curBestScore,score);
                }
            }
        }
    }
    return curBestScore;
}

function makeMove(){
    let testGrid;
    let bestScore=(comp==1)?(-Infinity):(Infinity);
    let moveIndex=[];
    for(let i=0;i<3;i++){
        for(let j=0;j<3;j++){
            if(playgrid[i][j]===-1){
                testGrid=[[...playgrid[0]], [...playgrid[2]], [...playgrid[2]]];
                testGrid[i][j]=comp;
                let score = minimax(player,testGrid);
                if(comp==1){
                    if(score>bestScore){
                        bestScore=score;
                        moveIndex[0]=i;
                        moveIndex[1]=j;
                    }
                }
                else{
                    if(score<bestScore){
                        bestScore=score;
                        moveIndex[0]=i;
                        moveIndex[1]=j;
                    }
                }
                console.log(score,bestScore, i, j, testGrid);
            }
        }
    }
    // console.log(moveIndex,bestScore);
    playgrid[moveIndex[0]][moveIndex[1]]=comp;
    grid[moveIndex[0]][moveIndex[1]].innerHTML=(comp===1)?"X":"O";
    if(hasWon(comp,playgrid)){
        gameflag=comp;
        document.querySelector(".indicator").innerHTML=("<span class=salsa> "+((comp===1)?"X":"O")+"</span> WON");
    }
    if(gameflag==-1){
        if(isDraw(playgrid)){
            gameflag=2;
            document.querySelector(".indicator").innerHTML=("GAME IS A DRAW");
        }
    }
}