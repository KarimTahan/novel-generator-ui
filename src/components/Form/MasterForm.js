import React from 'react';
import '../.././stylesheets/Form.css';
import Widget from '../FutureDesign/WidgetLoader';
import axios from 'axios';
import { Button, Input, InputNumber, Form, Select} from 'antd';


const { Option } = Select;

/**
 * Master form class, component implementing a Form with multiples steps before user completes.
 * Also handles submit and POST request
 * Response is the generated text by the ML model
 * Text is then formatted and displayed to the user
 */
export default class MasterForm extends React.Component {
    constructor(props) {
      super(props)
      this.state = {
          showForm : true,
          isLoading : false,
          showText : false,
          generatedText: '',
          currentStep: 1,
          author:'',
		      length:0,
          seed: ' '
      }
    }
    /**
     * Function that renders the widget, while awaiting response from flask api
     * Based on a flag set in the state props
     */
    renderWidget(){
      return(
          <Widget/>
      )
    }
   /**
     * Function that renders the form
     * Based on a flag set in the state props
     */
    renderForm(){
      return (
        <Form className="form" onSubmit={this.handleSubmit} encType="multipart/form-data">
        {/* 
          render steps
        */}
          <Step1 
            currentTitle='Choose Author'
            currentStep={this.state.currentStep} 
            handleChange={this.handleChange}
            author={this.state.author}
          />
          <Step2 
            currentTitle='Doc Length'
            currentStep={this.state.currentStep} 
            handleChange={this.handleChange}
            length={this.state.length}
          />
          <Step3 
            currentTitle='Starting Text'
            currentStep={this.state.currentStep} 
            handleChange={this.handleChange}
            seed={this.state.seed}
          />
           {this.descriptionExample()}
           {this.previousButton()}
           {this.nextButton()}
  
        </Form>
      );

    }
    /**
     * Function that renders the generated text from the flask api
     * Based on a flag set in the state props
     */
    renderText(){
      return(
        <div className="output">
            <p>
              {this.state.generatedText.replace(/\\n/g, " ")}
            </p>
            <Button id="again" type="primary" onClick={this._again}>Again</Button>     
        </div>
      );
    }

    /**
     * Function that send post request and sets the response(generated text) in the state props
     * Also sets flags for which div to render from state props
     * Async function
     * @param {*} url 
     * @param {*} formData 
     */
    async getResponse(url,formData){
       await axios.post(url,formData) //wait for response
      .then(response =>{// then save response and set text visible and loading widget hidden
         var resp = response;
        this.setState({generatedText : resp.data.response});
        this.setState({showText:true, isLoading:false});
      });
    }

        /**
     * Class Function handle state props on change of form step
     * 
     */
    handleChange = name => value => {
      this.setState({
        [name]: value
      })    
    }
    
  /**
   * Function that handles event once user clicks on submit
   * Append all fields in form to FormData format to send to Flask Api
   * Note: Flask API also accepts JSON format  
   */   
    handleSubmit = event => {
      if(this.state.currentStep ===3 && this.state.seed != null)
      {
        this.setState({isLoading:true, showForm:false})
        
        event.preventDefault()//prevent page refresh
        
              const author = this.state.author
              const length = this.state.length
              const seed = this.state.seed
          //URL for POST Request     
          var url = 'http://localhost:5000/prediction';
  
          //Form Data obj
          var formData = new FormData();
          //append form data for multipart/form-data key:value
          //console.log(author + " "+ length + seed);
          formData.delete('seed')
          formData.append('author', author)
          formData.append('length', Math.round(length))
          formData.append('seed',seed)
          this.getResponse(url,formData)
      }
      event.preventDefault()
      }

    /**
     * Function to keep track of current step of the user
     */
    _next = () => {
      let currentStep = this.state.currentStep
      currentStep = currentStep >= 2? 3: currentStep + 1 
      this.setState({
        currentStep: currentStep
      })
    }

    _again = () => {
      window.location.reload();
      return false;
    }

    /**
     * Function keeping track of which step is the previous step
     */
    _prev = () => {
      let currentStep = this.state.currentStep
      currentStep = currentStep <= 1? 1: currentStep - 1
      this.setState({
        currentStep: currentStep
      })
    }
  
  /*
  * Function used to render the previous button
  * will not be rendrered if step is 1
  */
  previousButton() {
    let currentStep = this.state.currentStep;
    if(currentStep !==1){
      return (
        <Button id="previous" type="default" onClick={this._prev}>Previous</Button>     
      )
    }
    return null;
  }
   /*
  * Function used to render the next button
  * will not be rendrered if step is 3
  */
  nextButton(){
    let currentStep = this.state.currentStep;
    if(currentStep === 2 && this.state.length === "")
      {
        
      return null;
      }
      else if(currentStep === 1 && this.state.author === "")
      {
        return null;
      }
      else if (currentStep === 3){
        return (
          <Button id="next" type="primary" onClick={this.handleSubmit}>Submit</Button>     
        )
      }
      else if(currentStep > 2)
      {
        return null;
      }
      else if(currentStep === 2 && this.state.length < 0)
      {
        return null;
      }
      else
      {
      return (
        <Button id="next" type="primary" onClick={this._next}>Next</Button>     
      )
    }
    
  }
  /**
   * Function meant to display form requirement/ examples the user must fill
   */
  descriptionExample(){
    let currentStep = this.state.currentStep;
    if(currentStep===1){ //Author
      return (
        <div>
          <h4><u>Author:</u></h4>
          <p>[Required] Select an author you which to mimic writing style.</p>
          <p>Note: Author List is in drop down. If you which to read about our authors, visit Our Authors page.</p>
        </div>
      )
    }
    if(currentStep === 2){//Length
      return (
        <div>
          <h4><u>Length</u></h4>
          <p>Description:The seed is the amount of characters you which to generate in the text.</p>
          <p>NOTE: Depending on the length; example 100,000 characters or more may take time</p>
        </div>
      )
    }
    if(currentStep===3){//Seed
      return(
        <div>
          <h4><u>Seed</u></h4>
          <p>Note: Start the generated text off with your own words.</p>
        </div>
      )
    }
  }
  /**
   * Main render, will render the div on which is flagged true
   */
    render() {    
      return (
        <React.Fragment>
          {this.state.showText && this.renderText()} {/**Generated Text*/ }
          {this.state.showForm && this.renderForm()} {/**Form */}
          {this.state.isLoading && this.renderWidget()}{/**Loading Widget */}
        </React.Fragment>
        
      );
    }
  }
  /**
   * Prompts the user to select Author in which writting style they want the ML model to generate
   * [Required Field]
   * @param {*} props 
   */
  function Step1(props) {
    if (props.currentStep !== 1) {
      return null
    } 
    return(
        <div className="form-group">
            <h3>Select Author</h3>
                <Select size="large" defaultValue="" id="author" name="author" placeholder="Select Author..." required onChange={props.handleChange("author")}>
                    <Option disabled hidden value="" >Select Author..</Option>
                    <Option value="shakespeare">Shakespeare</Option>
                    <Option value="simpson">Homer Simpson</Option>
                    <Option value="poe">Edgar Allan Poe</Option>
                </Select>
            <br/>
            <br/>
        </div>
    );
  }
  /**
   * Function will prompt user to select the length of the text in chars generated in response from the Flask API
   * [Required fields]
   * @param {*} props 
   */
  function Step2(props) {
    if (props.currentStep !== 2) {
      return null
    } 
    return(
        <div className="form-group">
            <h3>Doc Length</h3>
            <InputNumber type="number" size="large" id="length" name="length" min={0} placeholder="Word Length" onChange={props.handleChange("length")} required/>
        </div>
    );
  }
  /**
   * Function allowing the user to generate the first sentence/sentences of the text
   * [Required Field]
   * @param {*} props 
   */
  function Step3(props) {
    if (props.currentStep !== 3) {
      return null
    } 
    return(
      <React.Fragment>
       <div className="form-group">
          <h3>Starting Text</h3>   
          <Input id="seed" name="seed" placeholder="Write something.." required onChange={props.handleChange("seed")} style={{height:'100px'}}></Input>        
        </div>     
      </React.Fragment>
    );
  }
