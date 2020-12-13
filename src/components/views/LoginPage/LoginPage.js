import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { loginUser } from '../../../_actions/user_action'
import { withRouter } from 'react-router-dom'
import { Form, Input, Button, Layout  } from 'antd';
import { EyeInvisibleOutlined, EyeTwoTone,  } from '@ant-design/icons';
function LoginPage(props) {

  const dispatch = useDispatch();

  const [Email, setEmail] = useState("")
  const [Password, setPassword] = useState("")
  const {Content} = Layout;

  // 이메일 패스워드 타이핑 하게 해줌
  const onEmailHandler = (event) =>{
    setEmail(event.currentTarget.value)
  }
  const onPasswordHandler = (event) =>{
    setPassword(event.currentTarget.value)
  }

  // submit
  const onSubmitHandler = (event) =>{
    // 계속 새로고침 방지
    event.preventDefault();
    
    let body = {
      email: Email,
      password: Password
    }

    dispatch(loginUser(body))
      .then(response =>{
        if (response.payload.loginSuccess){
          props.history.push('/')
        } else{
          alert('Login Failed')
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
    offset: 10,
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
        
        <Form.Item {...tailLayout}>
          <Button type="primary" htmlType="submit" onClick={onSubmitHandler}>
            Submit
          </Button>
        </Form.Item>
      </Form>
    </Content>
     {/* <form style={{display: 'flex', flexDirection: 'column'}}
        onSubmit = {onSubmitHandler}
      >
        <label>Email</label>
        <input type="email" value={Email} onChange={onEmailHandler} />
        <label>Password</label>
        <input type="password" value={Password} onChange={onPasswordHandler} />
        
        <br />
        <button>
          Login
        </button>
      </form> */}
    </div>
    
  )
}

export default withRouter(LoginPage)
