import React from 'react';
import { Menu } from 'antd';
import {useSelector} from 'react-redux';

function LeftMenu(props) {
  const user = useSelector(state => state.user)

  if(!user.loginSuccess) {
    return(
      <></>
    )
  }
  else if(user.loginSuccess && user.loginSuccess.user.role !== 0){
    return(
    <Menu mode={props.mode}>
      <Menu.Item key="mail">
        <a href="/Exam">Exam</a>
      </Menu.Item>
      <Menu.Item key="mail">
        <a href="/maketest">MakeExam</a>
      </Menu.Item>
    </Menu>
    ) 
  }
  else{
    return(
      <Menu mode={props.mode}>
        <Menu.Item key="mail">
          <a href="/Exam">Exam</a>
        </Menu.Item>
      </Menu>
      ) 
  }
    
    
}

export default LeftMenu