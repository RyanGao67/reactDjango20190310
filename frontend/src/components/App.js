import React from "react";
import ReactDOM from "react-dom";
import axios from "axios";
import Board from "./Board";
import Gamecontrol from "./Gamecontrol";
class App extends React.Component {
    // As this is a relatively simply app
    // I manage the whole state in App component
    // Detail store the number of each cell
    // Revealed store whether the cell is revealed
    // GameId can be viewed as Id of a channel
    // Allbuttons store more detailed information of each cell
    // Status can be Pending, Win, or Lost
    // If the width height is too big or too small, waring 
    // store the information to tell the player
    constructor(props) {
      super(props);
      this.state = {
        width: 3,
        height : 3,
        mines : 2,
        detail : "101000000",
        revealed : "nnnnnnnnn",
        gameId : '1',
        allButtons : [],
        status:"Pending",
        warning:"",
      };
    }
    
    // state.reavealed and state.detail are strings 
    // Example: width=3, height=3, detail='101000000'
    // The actural matrix is [[1,0,1],[0,0,0],[0,0,0]]
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
    
    // This function is a helper function used in DFS
    // To determine the validaty of current index
    isValid = (row, column)=>{
      if(row<0)return false;
      if(row>=this.state.height)return false;
      if(column<0)return false;
      if(column>=this.state.width)return false;
      return true;
    }
    
    // Once form submitted 
    // We'll store the information to the backend
    // Also we need to update the game 
    handleSubmit = (event) => {
        event.preventDefault();
        if(this.state.width<3){this.setState({warning:"Width at least 3"});return;}       
        if(this.state.height<3){this.setState({warning:"Height at least 3"});return;}
        if(this.state.width>10){this.setState({warning:"Width at most 10"});return;}
        if(this.state.height>10){this.setState({warning:"Height at most 10"});return;}
        if(this.state.mines<1){this.setState({warning:"Mines at least 1"});return;}
        let data = {
          width:this.state.width,
          height:this.state.height,
          mines:this.state.mines,
          gameId:this.state.gameId,
          action:"reset",
          status:"Pending"
        };
        // user axios to talk to the backend
        axios.defaults.xsrfCookieName = 'csrftoken'
        axios.defaults.xsrfHeaderName = 'X-CSRFToken'
        axios({
          method: 'post',
          url: 'https://reactdjango20190311-assiduousryan.c9users.io/update/',
          data: JSON.stringify(data)
        }).then(response => {
          this.setState({
            width:response.data.width,
            height:response.data.height,
            mines:response.data.mines,
            detail:response.data.detail,
            status:response.data.status,
            warning:""
          },
          ()=>{
            this.recoverMatrix(response.data.width,response.data.height,response.data.revealed,response.data.detail)
          })
        })
      }
      
      
    // When the player type in the specific gameId
    // the player should be able to resume the game
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
          this.setState({
            width:response.data.width,
            height:response.data.height,
            mines:response.data.mines,
            revealed:response.data.revealed,
            detail:response.data.detail,
            status:response.data.status,
            warning:""
          },
          ()=>{
            this.recoverMatrix(response.data.width,response.data.height,response.data.revealed,response.data.detail)
          })
        })
    }
    
    // Whenever the player update the form field 
    // the stata will change accordingly
    handleGameIdChange = (e)=>{this.setState({gameId:e.target.value})}
    handleHeightChange = (e)=>{this.setState({height:e.target.value})}
    handleMinesChange = (e)=>{this.setState({mines:e.target.value})}
    handleWidthChange = (e)=>{this.setState({width:e.target.value})}
    
    // This function will take care of the cell click action
    // Three cases here 
    // 1. click on the number, reveal the number
    // 2. click on safe place, reveal all the adjancent area
    // 3. click on mine, lose the game
    // To find all the adjancent safe area, I use the depth first search
    // As I limited the size of the map to be at most 10*10, it is safe
    onCellClick = (e)=>{
      if(this.state.status=="Win" || this.state.status=='Lost')return;  // When game over player can nolonger click on button
        let currow = e.target.getAttribute('row');
        let curcolumn = e.target.getAttribute('column');
        let countN = currow*this.state.width+curcolumn;
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
    // When all the information is updated 
    // We need to store the information to the backend 
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
            status:this.state.status,
        };
        axios.defaults.xsrfCookieName = 'csrftoken'
        axios.defaults.xsrfHeaderName = 'X-CSRFToken'
        axios({
          method: 'post',
          url: 'https://reactdjango20190311-assiduousryan.c9users.io/move/',
          data: JSON.stringify(data)
        });
    }
    
    // This is a nice mark to show the status of game
    // under the map
    showStatus=()=>{
        switch(this.state.status){
          case('Pending'):return <a className="ui teal tag label">{this.state.status}</a>
          case('Lost'):return <a className="ui red tag label">{this.state.status}</a>
          case('Win'):return <a className="ui tag label">{this.state.status}</a>
          default: return <div/>
        }
    }
    
    // include three parts
    // game conteol
    // map
    // game status
    render() {
        return (
          <div className="ui one column stackable center aligned page grid">
            <div className="column twelve wide">
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
                    onContextMenu = {this.onContextMenu}
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