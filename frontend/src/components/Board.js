import React from "react";



class Board extends React.Component{
    changeButton =(row,indexr,cell,indexc)=>{
        if(cell.revealed && cell.content!=9)return <button
                className="ui icon button" 
                style={{height:'2em',width:'2em','backgroundColor':'powderblue',margin:'0.5em'}}
                key={"mykey"+indexr*this.props.allButtons[0].length+indexc}
                onClick={this.props.onCellClick}
                row={indexr}
                column={indexc}
            >
            {cell.content}
        </button>;
        else if(cell.revealed && cell.content==9)return <button
                className="ui icon button" 
                style={{height:'2em',width:'2em','backgroundColor':'red',margin:'0.5em'}}
                key={"mykey"+indexr*this.props.allButtons[0].length+indexc}
                onClick={this.props.onCellClick}
                row={indexr}
                column={indexc}
        >
            {cell.content}
        </button>
        else return <button
                className="ui icon button" 
                style={{height:'2em',width:'2em',margin:'0.5em'}}
                key={"mykey"+indexr*this.props.allButtons[0].length+indexc}
                onClick={this.props.onCellClick}
                row={indexr}
                column={indexc}
        >
        </button>
    }
    showButtons = ()=>{
        return this.props.allButtons.map(
            (row,indexr)=>{
                const cells =  row.map(
                    (cell,indexc)=>{
                        return  this.changeButton(row, indexr, cell, indexc)
                    }
                );
                return <div key={"rowkey"+indexr}>
                    {cells}
                </div>
            }
        );
    }
    render(){
        return (
            <div>
                {this.showButtons()}
            </div>
        );
    }
}

export default Board;