import React from "react";
import ReactDOM from "react-dom";
import axios from "axios";
import Board from "./Board";
import Gamecontrol from "./Gamecontrol";
class App extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        width: 2,
        height : 2,
        mines : 1,
        detail : "1000",
        revealed : "nnnn",
        gameId : '',
        allButtons : [],
        status:"Pending",
        warning:""
      };
    }
    recoverMatrix = (width, height, revealed, detail)=>{
      let buttons = [];
      for(let i=0;i<height;i++){
        let row = []
        for(let j=0;j<width;j++){
          let temp = {revealed:revealed[i*width+j]=='n'?false:true,content:parseInt(detail[i*width+j])};
          row.push(temp);
        }
        buttons.push(row);
      }
      for(let i=0;i<height;i++){
        for(let j=0;j<width;j++){
          if(buttons[i][j].content===-1)continue;
            if(buttons[i][j].content===0){
              if(this.isValid(i-1, j-1)&&buttons[i-1][j-1].content===9)buttons[i][j].content++;
              if(this.isValid(i-1, j)&&buttons[i-1][j].content===9)buttons[i][j].content++;
              if(this.isValid(i-1, j+1)&&buttons[i-1][j+1].content===9)buttons[i][j].content++;
              if(this.isValid(i, j-1)&&buttons[i][j-1].content===9)buttons[i][j].content++;
              if(this.isValid(i, j+1)&&buttons[i][j+1].content===9)buttons[i][j].content++;
              if(this.isValid(i+1, j-1)&&buttons[i+1][j-1].content===9)buttons[i][j].content++;
              if(this.isValid(i+1, j)&&buttons[i+1][j].content===9)buttons[i][j].content++;
              if(this.isValid(i+1, j+1)&&buttons[i+1][j+1].content===9)buttons[i][j].content++;
            }
          }
        }
        this.setState({allButtons:buttons},()=>{console.log(this.state.allButtons)});
    }
    
    isValid = (row, column)=>{
      if(row<0)return false;
      if(row>=this.state.height)return false;
      if(column<0)return false;
      if(column>=this.state.width)return false;
      return true;
    }
    
    handleSubmit = (event) => {
        event.preventDefault();
        if(this.state.width<3){this.setState({warning:"Width at least 3"});return;}
        if(this.state.height<3){this.setState({warning:"Height at least 3"});return;}
        if(this.state.width>10){this.setState({warning:"Width at most 10"});return;}
        if(this.state.height>10){this.setState({warning:"Height at most 10"});return;}
        if(this.state.mines<1){this.setState({warning:"Mines at least 1"});return;}
        console.log(this.state.height);
        let data = {
          width:this.state.width,
          height:this.state.height,
          mines:this.state.mines,
          gameId:this.state.gameId,
          action:"reset",
          status:"Pending"
        };
        axios.defaults.xsrfCookieName = 'csrftoken'
        axios.defaults.xsrfHeaderName = 'X-CSRFToken'
        axios({
          method: 'post',
          url: 'https://reactdjango20190311-assiduousryan.c9users.io/update/',
          data: JSON.stringify(data)
        }).then(response => {
          this.setState({width:response.data.width,height:response.data.height,mines:response.data.mines},
          ()=>{
            this.recoverMatrix(response.data.width,response.data.height,response.data.revealed,response.data.detail)
          })
        })
      }
    onSubmitRetrieve=(e)=>{
        e.preventDefault();
        let data = {
            gameId:this.state.gameId,
            action:"retrieve"
        };
        axios.defaults.xsrfCookieName = 'csrftoken'
        axios.defaults.xsrfHeaderName = 'X-CSRFToken'
        axios({
          method: 'post',
          url: 'https://reactdjango20190311-assiduousryan.c9users.io/update/',
          data: JSON.stringify(data)
        }).then(response => {
          this.setState({width:response.data.width,height:response.data.height,mines:response.data.mines},
          ()=>{
            this.recoverMatrix(response.data.width,response.data.height,response.data.revealed,response.data.detail)
          })
        })
    }
    handleGameIdChange = (e)=>{this.setState({gameId:e.target.value})}
    handleHeightChange = (e)=>{this.setState({height:e.target.value})}
    handleMinesChange = (e)=>{this.setState({mines:e.target.value})}
    handleWidthChange = (e)=>{this.setState({width:e.target.value})}
    onCellClick = (e)=>{
        let currow = e.target.getAttribute('row');
        let curcolumn = e.target.getAttribute('column');
        if(this.state.allButtons[currow][curcolumn].content==9){
            this.setState(
                {
                    allButtons: 
                    this.state.allButtons.map((row)=>{ 
                        return (row).map((cell)=>{
                            let newCell = cell.content==9?{revealed:true, content:cell.content}:cell;
                            return newCell;
                        })
                    }),
                    status: "Lost"
                }, this.checkStatus
            );
        }
        else if(this.state.allButtons[currow][curcolumn].content===0){
            this.DFS(currow,curcolumn);
        }else{
            this.setState(
                {
                    allButtons: 
                    this.state.allButtons.map((row, indexr)=>{
                        return (row).map((cell,indexc)=>{
                            let newCell = {};
                            if(indexr==currow&&indexc==curcolumn){
                                newCell.revealed = true;
                                newCell.content = cell.content;
                                return newCell;
                            }
                            return cell;
                        })
                    })
                }, this.checkStatus
            );
        }
    }
    
    // When user click on empty cell 
    // Use depth first search to find adjancent one
    DFS = (row, column)=>{
        const allButtons = this.state.allButtons.map((raw)=>{return raw.slice()});
        this.helper(row, column, allButtons)
        this.setState({allButtons:allButtons},this.checkStatus);
    }
    // helper funtion is used in DFS to recursively 
    // call it selves
    helper = (row, column, matrix)=>{
        row = parseInt(row);
        column = parseInt(column);
        if(!this.isValid(row,column))return;
        if(matrix[row][column].revealed==false && matrix[row][column].content==0){
            matrix[row][column].revealed=true;
            this.helper(row-1,column-1, matrix);
            this.helper(row-1,column, matrix);
            this.helper(row-1,column+1, matrix);
            this.helper(row,column-1, matrix);
            this.helper(row,column+1, matrix);
            this.helper(row+1,column-1, matrix);
            this.helper(row+1,column, matrix);
            this.helper(row+1,column+1, matrix);
        }
        if(matrix[row][column].revealed==false && matrix[row][column].content!=0){
            matrix[row][column].revealed = true;
        }
    }
    // When all the safe cell is revealed
    // The player will win
    checkStatus = ()=>{
        if(this.state.status=='Lost') return this.updateServer();
        for(let i=0;i<this.state.height;i++){
            for(let j=0;j<this.state.width;j++){
                let curCell = this.state.allButtons[i][j];
                if(curCell.revealed == false && curCell.content!=9){
                    this.setState({status:"Pending"},this.updateServer);
                    return;
                }
            }
        }
        this.setState({status:"Win"},this.updateServer)
    }
    updateServer = ()=>{
        let revealed = '';
        for(let i=0;i<this.state.height;i++){
          for(let j=0;j<this.state.width;j++){
            if(this.state.allButtons[i][j].revealed)revealed+='y';
            else revealed+='n';
          }
        }
        const data = {
            gameId:this.state.gameId,
            revealed:revealed,
            status:this.state.status
        };
        axios.defaults.xsrfCookieName = 'csrftoken'
        axios.defaults.xsrfHeaderName = 'X-CSRFToken'
        axios({
          method: 'post',
          url: 'https://reactdjango20190311-assiduousryan.c9users.io/move/',
          data: JSON.stringify(data)
        });
    }
    
    showStatus=()=>{
        switch(this.state.status){
          case('Pending'):return <a class="ui teal tag label">{this.state.status}</a>
          case('Lost'):return <a class="ui red tag label">{this.state.status}</a>
          case('Win'):return <a class="ui tag label">{this.state.status}</a>
          default: return <div/>
        }
    }
    render() {
        return (
          <div class="ui one column stackable center aligned page grid">
            <div class="column twelve wide">
              <div>
                <div className="game-control">
                    <Gamecontrol
                        onSubmitRetrieve = {this.onSubmitRetrieve}
                        onSubmit = {this.handleSubmit}
                        handleWidthChange = {this.handleWidthChange}
                        handleHeightChange = {this.handleHeightChange}
                        handleMinesChange = {this.handleMinesChange}
                        handleGameIdChange = {this.handleGameIdChange}
                        width = {this.state.width}
                        height = {this.state.height}
                        mineCount = {this.state.mineCount}
                        gameId = {this.state.gameId}
                    />
                </div>
                <div className="ui warning message">{this.state.warning}</div>
                <div className="board">
                  <Board 
                    onCellClick = {this.onCellClick}
                    allButtons = {this.state.allButtons}
                  />
                </div>
                <div>
                  {this.showStatus()}
                </div>
            </div>
             </div>
          </div>

    );
  }
}
export default App;
const wrapper = document.getElementById("app");
wrapper ? ReactDOM.render(<App />, wrapper) : null;