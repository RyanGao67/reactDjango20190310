import React from "react";
import ReactDOM from "react-dom";
class Gamecontrol extends React.Component{
    
    render() {
        return (
          <div>
            <div className="ui form">
              <div className="three fields">
                <div className="field">
                  <label>
                    width:
                    <input type="text" value={this.props.width} onChange={this.props.handleWidthChange} />
                  </label>
                </div>
                <div className="field">
                  <label>
                    height:
                    <input type="text" value={this.props.height} onChange={this.props.handleHeightChange} />
                  </label>
                </div>
                <div className="field">
                  <label>
                    mines:
                    <input type="text" value={this.props.mines} onChange={this.props.handleMinesChange} />
                  </label>
                </div>
                <div className="field">
                  <label>
                    GameChannel:
                    <input type="text" value={this.props.gameId} onChange={this.props.handleGameIdChange} />
                  </label>
                </div>
                <div className="field">
                    <input type="submit" value="Submit" onClick={this.props.onSubmit} style={{height:'4em'}}/>
                </div>
              </div>
            </div>
            <div className="ui form">
              <div className="two fields">
                <div className="field">
                   <label>
                      GameChannel:
                      <input type="text" value={this.props.gameId} onChange={this.props.handleGameIdChange} />
                    </label>
                </div>
                <div className="field">
                     <input type="submit" value="Submit" onClick={this.props.onSubmitRetrieve} style={{height:'4em'}}/>
                </div>
              </div>
            </div>
          </div>
        );
    }
    
}

export default Gamecontrol;