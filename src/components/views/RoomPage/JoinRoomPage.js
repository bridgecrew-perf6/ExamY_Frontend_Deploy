import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { FetchExam, FetchQuestions } from '../../../_actions/user_action'
import { withRouter } from 'react-router-dom'
import { Radio, Row, Col, Typography, Pagination, Button, Input, Form, Layout } from 'antd';
import { RightSquareOutlined, UserOutlined, LoginOutlined, FormOutlined } from '@ant-design/icons';

function JoinRoomPage(props) {
  const user = useSelector(state => state.user);
  const {Content} = Layout;
  const dispatch = useDispatch();
  const { Title, Text } = Typography;
  const { Search} = Input;

  let [ExamId, setExamId] = useState("")
  const [ExamCode, setExamCode] = useState("")
  const [Questions, setQuestions] = useState([])
  const [RoomNo, setRoomNo] = useState(0)
  const [nowQuestion, setnowQuestion] = useState({
    title: "", choice1: "",choice2: "",choice3: "",choice4: "",
  })
  const [nowQuestionidx, setnowQuestionidx] = useState(1)
  const [ExamQuestions, setExamQuestions] = useState([])
  const [ExamAnswers, setExamAnswers] = useState([])
  
  const [UserExamCode, setUserExamCode] = useState("") // User가 방이름이랑 같이 입력할 코드
  const [UserDisabled, setUserDisabled] = useState(true)
  const [TotalQuestions, setTotalQuestions] = useState("")

  const [RadioValue, setRadioValue] = useState("")

  const onUserExamCode = (event) =>{
    setUserExamCode(event.currentTarget.value)
  }

  const onExamIdHandler = (event) =>{
    setExamId(event.currentTarget.value)
  }
  
  function onChangeHandler(checkedValues){
    setRadioValue(checkedValues.target.value)
    ExamAnswers[nowQuestionidx-1] = checkedValues.target.value
  }

  function onChangeQuestions(Numbers){
    setnowQuestionidx(Numbers)
    setnowQuestion({
      title : ExamQuestions[Numbers-1].title,
      choice1: ExamQuestions[Numbers-1].choice[0],
      choice2: ExamQuestions[Numbers-1].choice[1],
      choice3: ExamQuestions[Numbers-1].choice[2],
      choice4: ExamQuestions[Numbers-1].choice[3],
    })

    if(ExamAnswers[Numbers-1] === ""){
      setRadioValue("")
    }
    else{
      setRadioValue(ExamAnswers[Numbers-1])
    }
  }
  const onSearch = value =>{
    ExamId = value
    setExamId(value)
    dispatch(FetchExam({ Exam_id: ExamId }))
    .then(response =>{
       if (response.payload.fetchSuccess){
        setExamCode(response.payload.Exam_code)
        if(user.userData && user.userData.isAdmin){
          alert(`${value}시험의 방 코드를 응시자에게 알려주세요.`)
        }
        else{
          alert(`${value}시험의 방 코드를 입력하세요.`)
          setUserDisabled(false);
        }
       }
       else{
         alert(`${value} 이름을 가진 시험이 없습니다.`)
       }
    })

  }
  // submit
  const onSubmitHandler = (event) =>{
    // 계속 새로고침 방지
    event.preventDefault();
    let body = {
      Exam_id: ExamId 
    }

    dispatch(FetchExam(body))
    .then(response =>{
      if (response.payload.fetchSuccess){
        var arr = response.payload.QuestionIdx
        setTotalQuestions(arr.length*10)
        for(let i = 0; i<arr.length;i++){
          dispatch(FetchQuestions({Question_id : arr[i]})).then(
            response =>{
              if(response.payload.fetchSuccess){
                ExamQuestions.push(response.payload.QuestionInfo)
                ExamAnswers.push("")
                if(i == 0){
                  setnowQuestion({
                    title : ExamQuestions[0].title,
                    choice1: ExamQuestions[0].choice[0],
                    choice2: ExamQuestions[0].choice[1],
                    choice3: ExamQuestions[0].choice[2],
                    choice4: ExamQuestions[0].choice[3],
                  })
                }
              }
            }
          )
        }
          setRoomNo(1)
        } else{
          alert('Eaxm failed')
        }
      })
    }

    const onSubmitHandler2 = (event) =>{
    // 계속 새로고침 방지
    event.preventDefault();
    if(UserExamCode !== String(ExamCode)){
      alert("방이름과 코드가 다릅니다.")
    }
    else{
      let body = {
      Exam_id: ExamId 
    }
    
    dispatch(FetchExam(body))
    .then(response =>{
      if (response.payload.fetchSuccess){
        var arr = response.payload.QuestionIdx
        setTotalQuestions(arr.length*10)
        for(let i = 0; i<arr.length;i++){
          dispatch(FetchQuestions({Question_id : arr[i]})).then(
            response =>{
              if(response.payload.fetchSuccess){
                ExamQuestions.push(response.payload.QuestionInfo)
                ExamAnswers.push("")
                if(i == 0){
                  setnowQuestion({
                    title : ExamQuestions[0].title,
                    choice1: ExamQuestions[0].choice[0],
                    choice2: ExamQuestions[0].choice[1],
                    choice3: ExamQuestions[0].choice[2],
                    choice4: ExamQuestions[0].choice[3],
                  })
                }
              }
            }
          )
        }
          setRoomNo(1)
        } else{
          alert('Eaxm failed')
        }
      })
    }
    }
    
    const onEndExamHandler = (event) =>{
    // 계속 새로고침 방지
      event.preventDefault();
      let cnt = 0;
      let missing = [];
   
      for(let i = 0; i < ExamAnswers.length; i++){
        if(ExamAnswers[i] == ""){
          cnt++
          missing.push(i+1)
        } 
      }
      if(cnt !== 0){
        alert(`${missing} 번을 아직 풀지 않았습니다.`)
      }
      else{
        let correct = 0
        for(let i = 0; i < ExamAnswers.length; i++){
          if(ExamAnswers[i] == ExamQuestions[i].correct_idx){
            correct++
          } 
        }
        let score = (correct/ExamQuestions.length)*100
        alert(`${score}점 입니다. (총 ${ExamQuestions.length} 문제 중에 ${correct}문제 맞췄습니다.)`)
      }
    }


  const formItemLayout = {
    labelCol: {
      xs: { span: 12 },
      sm: { span: 10 },
    },
    wrapperCol: {
      xs: { span: 24 },
      sm: { span: 5 },
    },
  };

  const tailLayout = {
  wrapperCol: {
    offset: 10,
    span: 24,
    },
  };

  if(RoomNo == 0 && (user.userData && user.userData.isAdmin) ){
    return (
    <div style = {{
      display: 'flex', justifyContent: 'center', alignItems: 'center', width:'100%', height: '100vh'
    }}>
    <Content>
      <Form {...formItemLayout}>
        <Form.Item label = "Name">
        <Input size="large" placeholder={user.userData.name} prefix={<UserOutlined/>} disabled={true}/> 
        </Form.Item>

        <Form.Item label = "Exam Name">
        <Search placeholder="Input Exam Name"  onSearch={onSearch}/>
        </Form.Item>
        <Form.Item label = "Exam Code">

        <Input size="large" placeholder={ExamCode} prefix={<FormOutlined/>} disabled={UserDisabled}/> 
        </Form.Item>

        <Form.Item {...tailLayout}>
        <Button 
              type="primary" 
              shape="round" 
              icon={<LoginOutlined />} 
              size={"large"}
              htmlType="submit" 
              onClick={onSubmitHandler}> 
              Join Exam
            </Button>
        </Form.Item>
      </Form>
    </Content>
    </div>
   ) 
  }
  if(RoomNo == 0 && (user.userData && !user.userData.isAdmin) ){
    return (
    <div style = {{
      display: 'flex', justifyContent: 'center', alignItems: 'center', width:'100%', height: '100vh'
    }}>
    <Content>
      <Form {...formItemLayout}>
        <Form.Item label = "Name">
        <Input size="large" placeholder={user.userData.name} prefix={<UserOutlined/>} disabled={true}/> 
        </Form.Item>

        <Form.Item label = "Exam Name">
        <Search placeholder="Input Exam Name"  onSearch={onSearch}/>
        </Form.Item>
        <Form.Item label = "Exam Code">

        <Input size="large" placeholder="ExamCode" value={UserExamCode} onChange={onUserExamCode} disabled={UserDisabled} /> 
        </Form.Item>

        <Form.Item {...tailLayout}>
        <Button 
              type="primary" 
              shape="round" 
              icon={<LoginOutlined />} 
              size={"large"}
              htmlType="submit" 
              onClick={onSubmitHandler2}> 
              Join Exam
            </Button>
        </Form.Item>
      </Form>
    </Content>
    </div>
   ) 
  }
  else{
    return (
      <div style = {{
      display: 'flex',justifyContent: 'center', alignItems: 'center', width:'100%', height: '50vh'}}>
      <form style={{display: 'flex', flexDirection: 'column'}}>
        <Radio.Group style={{ display :'block', height: '30px', lineHeight:'30px'}} value={RadioValue} onChange={onChangeHandler}>
        <Row gutter = {[0, 24]}>
          <Col span={100}>
            <Title level ={2}>Q. {nowQuestion.title}</Title>
          </Col>
        </Row>
        <Row gutter = {[0, 24]}>
          <Col span={24}>
            <Radio value="1">
              {nowQuestion.choice1}</Radio>
          </Col>
        </Row>
        <Row gutter = {[0, 24]}>
          <Col span={100}>
            <Radio value="2">{nowQuestion.choice2}</Radio>
          </Col>
        </Row>
        <Row gutter = {[0, 24]}>
          <Col span={100}>
            <Radio value="3">{nowQuestion.choice3}</Radio>
          </Col>
        </Row>
        <Row gutter = {[0, 24]}>
          <Col span={100}>
            <Radio value="4">{nowQuestion.choice4}</Radio>
          </Col>
        </Row>
         <Row gutter = {[0, 24]}>
          <Col span={100}>
            <Pagination simple  
              total={TotalQuestions} 
              current ={nowQuestionidx}
              onChange = {onChangeQuestions} />
          </Col>
        </Row>
        <Row gutter = {[0, 24]}>
          <Col span={100}>
            <Button 
              type="primary" 
              shape="round" 
              icon={<RightSquareOutlined />} 
              size={"large"}
              htmlType="submitTe" 
              onClick={onEndExamHandler}> 
              End Exam 
            </Button>
          </Col>
        </Row>
        </Radio.Group>
      </form>
    </div>
    )
  }
}

export default withRouter(JoinRoomPage)
