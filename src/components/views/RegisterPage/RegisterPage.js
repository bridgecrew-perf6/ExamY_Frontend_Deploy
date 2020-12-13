import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { registerUser } from '../../../_actions/user_action'
import { withRouter } from 'react-router-dom'
import Axios from 'axios';
import { Form, Input, Button, Upload, Layout } from 'antd';
import { EyeInvisibleOutlined, EyeTwoTone, UploadOutlined } from '@ant-design/icons';
import { FormProvider } from 'antd/lib/form/context';

function RegisterPage(props) {
  
  const dispatch = useDispatch();
  const {Content} = Layout;
  const [Email, setEmail] = useState("")
  const [Name, setName] = useState("")
  const [Password, setPassword] = useState("")
  const [ConfirmPassword, setConfirmPassword] = useState("")
  const [UserImage, setUserImage] = useState("")
  const [DBimage, setDBimage] = useState("")

  const onEmailHandler = (event) =>{
    setEmail(event.currentTarget.value)
  }
  const onNameHandler = (event) =>{
    setName(event.currentTarget.value)
  }
  const onPasswordHandler = (event) =>{ 
    setPassword(event.currentTarget.value)
  }
  const onConfirmPasswordHandler = (event) =>{
    setConfirmPassword(event.currentTarget.value)
  }
  
  
  const onUserImageHandler = (event) => {
    const formData = new FormData();
    formData.append('profile_img', event.target.files[0]);
    Axios.post('http://13.209.224.207:5000/api/users/upload', formData,{
      header: {'content-type' : 'multipart/form-data'},
    }).then((response) => {
      console.log(response.data.filename);
      setDBimage(response.data.filename)
    })
    setUserImage(event.currentTarget.value)
  }

  const onSubmitHandler = (event) =>{
    // 계속 새로고침 방지
    event.preventDefault();
    if(Password !== ConfirmPassword){
      return alert('비밀번호와 비밀번호 확인이 일치하지 않습니다.')
    }
    let body = {
      email: Email,
      name: Name,
      password: Password,
      image: DBimage
    }

    dispatch(registerUser(body))
    .then(response => {
      if(response.payload.success){
          props.history.push("/login")
        } else{
          alert("Failed to sign up.")
        }
      })
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
    offset:10,
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
          label="Email"
          name="email"
          rules={[
            {
              type: 'email',
              message: 'The input is not valid E-mail!',
            },
            {
              required: true,
              message: 'Please input your E-mail!',
            },
          ]}
        >
          <Input placeholder="Input e-mail" value={Email} onChange={onEmailHandler}/>
        </Form.Item>

        <Form.Item
          label="Name"
          name="name"
          rules={[
            {
              required: true,
              message: 'Please input your Name!',
            },
          ]}
        >
          <Input placeholder="Input your Name" value={Name} onChange={onNameHandler}/>
        </Form.Item>

        <Form.Item
          label="Password"
          name="password"
          rules={[
            {
              required: true,
              message: 'Please input your Password!',
            },
          ]}
        >
          <Input.Password
            placeholder="input password"
            iconRender={visible => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
            value={Password} onChange={onPasswordHandler}
          />
        </Form.Item>

        <Form.Item
          label="ConfirmPassword"
          name="confirmpassword"
          rules={[
            {
              required: true,
              message: 'Please input your Confirm Password!',
            },
          ]}
        >
          <Input.Password
            placeholder="input Confirm Password"
            iconRender={visible => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
            value={ConfirmPassword} onChange={onConfirmPasswordHandler}
          />
        </Form.Item>
        <Form.Item 
          label="Upload Image"
          name="Upload Image"
        >
          <Input type="file" accept='image/jpg, image/png, image/jpeg' value={UserImage} onChange={onUserImageHandler} /> 
        </Form.Item>
        <Form.Item {...tailLayout}>
          <Button type="primary" htmlType="submit" onClick={onSubmitHandler}>
            Submit
          </Button>
        </Form.Item>
      </Form>
    </Content>
    </div>
  )
}

export default withRouter(RegisterPage)
