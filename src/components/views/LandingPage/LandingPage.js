import React, { useEffect } from 'react'
import axios from 'axios'
import { withRouter } from 'react-router-dom'

function LandingPage(props) {
  
  useEffect(() => {
    axios.get('http://13.209.224.207:5000/api/hello')
    .then(response=> {console.log(response.data)})
  }, [])


  return (
    <div style = {{
      display: 'flex', justifyContent: 'center', alignItems: 'center', width:'100%', height: '100vh'
    }}>
      <h2> 시작 페이지 </h2>
    </div>
  )
}

export default withRouter(LandingPage)
