import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { MakeTest, UploadQuestion } from '../../../_actions/user_action'
import { withRouter } from 'react-router-dom'
import { Button, Input, Form, Layout } from 'antd';

function MakeTestPage(props) {

  const dispatch = useDispatch();
  const {Content} = Layout;
  const [Title, setTitle] = useState("")
  const [Choice1, setChoice1] = useState("")
  const [Choice2, setChoice2] = useState("")
  const [Choice3, setChoice3] = useState("")
  const [Choice4, setChoice4] = useState("")
  const [CorrectIdx, setCorrectIdx] = useState("")

  const [UploadedQuestions, setUploadedQuestions] = useState(0)

  const [ExamId, setExamId] = useState("")
  const [QuestionsIds, setQuestionsIds] = useState([])
  

  const setTitleHandler = (event) =>{ 
    setTitle(event.currentTarget.value)
  }
  const setChoiceHandler1 = (event) =>{ 
    setChoice1(event.currentTarget.value)
  }
  const setChoiceHandler2 = (event) =>{ 
    setChoice2(event.currentTarget.value)
  }
  const setChoiceHandler3 = (event) =>{ 
    setChoice3(event.currentTarget.value)
  }
  const setChoiceHandler4 = (event) =>{ 
    setChoice4(event.currentTarget.value)
  }
  const setCorrectIdxHandler = (event) =>{ 
    setCorrectIdx(event.currentTarget.value)
  }

  const setExamHandler = (event) =>{ 
    setExamId(event.currentTarget.value)
  }

  const onUploadHandler = (event) =>{
    // 계속 새로고침 방지
    event.preventDefault();
    
    let body = {
      Question_id: Math.floor( Math.random() * 100000 ),
      title: Title,
      choice : [Choice1,Choice2,Choice3,Choice4],
      correct_idx : CorrectIdx
    }

    QuestionsIds.push(body.Question_id)
    
    dispatch(UploadQuestion(body))
    .then(response => {
      if(response.payload.success){
        setUploadedQuestions(UploadedQuestions + 1)
        setTitle("")
        setChoice1("")
        setChoice2("")
        setChoice3("")
        setChoice4("")
        setCorrectIdx("")
        } else{
          alert("Failed to Upload Question Info.")
        }
      })
  }

  const onMakeTestHandler = (event) =>{
    // 계속 새로고침 방지
    
    event.preventDefault();
    let body = {
      Exam_id: ExamId,
      Exam_code:  Math.floor( Math.random() * 1000000 ),
      Questions : QuestionsIds
    }
 
    dispatch(MakeTest(body))
    .then(response => {
      if(response.payload.success){
          props.history.push("/")
        } else{
          alert("Failed to Send Question Info.")
        }
      })
  }

  const formItemLayout = {
    labelCol: {
      xs: { span: 10 },
      sm: { span: 15 },
    },
    wrapperCol: {
      xs: { span: 24 },
      sm: { span: 10 },
    },
  };

  const formItemLayout2 = {
    labelCol: {
      xs: { span: 5 },
      sm: { span: 5 },
    },
    wrapperCol: {
      xs: { span: 4 },
      sm: { span: 6 },
    },
  };

  const tailLayout = {
  wrapperCol: {
    offset: 16,
    span: 24,
    },
  };
  const tailLayout2 = {
  wrapperCol: {
    offset: 5,
    span: 24,
    },
  };

  return (
    <div style = {{
        display: 'flex', justifyContent: 'center', alignItems: 'center', width:'100%', height: '100vh'
      }}>
    <Content>
      <Form {...formItemLayout}>
        <Form.Item
          label = "Question Title"
        >
          <Input placeholder="Title" value={Title} onChange={setTitleHandler}/>
        </Form.Item>

        <Form.Item
          label = "Choice1"
        >
          <Input placeholder="Choice1" value={Choice1} onChange={setChoiceHandler1}/>
        </Form.Item>
        
        <Form.Item
          label = "Choice2"
        >
          <Input placeholder="Choice2" value={Choice2} onChange={setChoiceHandler2}/>
        </Form.Item>

        <Form.Item
          label = "Choice3"
        >
          <Input placeholder="Choice4" value={Choice3} onChange={setChoiceHandler3}/>
        </Form.Item>

        <Form.Item
          label = "Choice4"
        >
          <Input placeholder="Choice4" value={Choice4} onChange={setChoiceHandler4}/>
        </Form.Item>

        <Form.Item
          label = "Correct Idx"
        >
          <Input placeholder="Choice4" value={CorrectIdx} onChange={setCorrectIdxHandler}/>
        </Form.Item>

        <Form.Item {...tailLayout}>
          <Button type="primary" htmlType="reset" onClick={onUploadHandler}>
            Upload Questions
          </Button>
        </Form.Item>
      </Form>
    </Content>
    <Content>
      <Form {...formItemLayout2}>
        <Form.Item
          label = "Questions"
        >
          <Input value={UploadedQuestions} disabled={true}/>
        </Form.Item>

        <Form.Item
          label = "Exam_Name"
        >
          <Input placeholder="Exam_Name" value={ExamId} onChange={setExamHandler}/>
        </Form.Item>

        <Form.Item {...tailLayout2}>
          <Button type="primary" htmlType="submit" onClick={onMakeTestHandler}>
            End make Test
          </Button>
        </Form.Item>
      </Form>
    </Content>
    </div>
   
  )
}

export default withRouter(MakeTestPage)
