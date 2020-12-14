import axios from "axios";
import { OpenVidu } from "openvidu-browser";
import React, { useState, useEffect, useRef } from "react";
import UserVideoComponent from "./UserVideoComponent";
import * as ml5 from "ml5";
import * as faceapi from "face-api.js";
import {
  Button,
  notification,
  Form,
  Input,
  Layout,
  PageHeader,
  Statistic,
  message,
  Spin,
  Result,
  List,
  Avatar,
  Radio,
  Row,
  Col,
  Typography,
  Pagination,
} from "antd";
import "antd/dist/antd.css";
import { useDispatch, useSelector } from "react-redux";
import { FetchExam, FetchQuestions } from "../../../_actions/user_action";
import { withRouter } from "react-router-dom";
import {
  RightSquareOutlined,
  UserOutlined,
  LoginOutlined,
  FormOutlined,
} from "@ant-design/icons";
import "./JoinRoom.css";

const { Sider, Content } = Layout;
const { Countdown } = Statistic;
const { Title, Text } = Typography;
const { Search } = Input;

let score = 0;
let correct = 0;

const bucketName = "developjikvideo";
const bucketRegion = "us-east-1"; // 리전
const IdentityPoolId = "us-east-1:5eca9ef0-7737-4709-86bd-c45661c424f7";
const albumName = "video";

const s3 = new window.AWS.S3({
  apiVersion: "2006-03-01",
  params: {
    Bucket: bucketName,
  },
});

window.AWS.config.update({
  region: bucketRegion,
  credentials: new window.AWS.CognitoIdentityCredentials({
    IdentityPoolId: IdentityPoolId,
  }),
});

let OV;
let records;
let connectionData = [];

let faceapiInterval;
let objectdetectInterval;
let sidefaceInterval;
let faceReocogCheckInterval

let userimage = "";

function JoinRoomPage(props) {
  const user = useSelector((state) => state.user);
  let videoRef = useRef();
  let objectDetector;
  let classifier;
  let blob;

  let images = ["/uploads/unknown1.png", "/uploads/unknown2.png", "/uploads/unknown3.png", "/uploads/unknown4.png", "/uploads/unknown5.png"];
  // axios로 사용자 이미지 요청하여 저장할 변수

  // const OPENVIDU_SERVER_URL = "https://" + "window.location.hostname" + ":4443";
  const OPENVIDU_SERVER_URL =
    "https://ec2-52-78-164-15.ap-northeast-2.compute.amazonaws.com";
  const OPENVIDU_SERVER_SECRET = "MY_SECRET";

  const tailLayout = {
    wrapperCol: {
      offset: 8,
      span: 16,
    },
  };

  const [initial, setInital] = useState(0);
  const [test, setTest] = useState(0);
  const [timer, setTimer] = useState(0);

  // ================================================

  const userLoginInfo = useSelector((state) => state.user);
  const dispatch = useDispatch();

  let [ExamId, setExamId] = useState("");
  const [ExamCode, setExamCode] = useState("");
  const [Questions, setQuestions] = useState([]);
  const [RoomNo, setRoomNo] = useState(0);
  const [nowQuestion, setnowQuestion] = useState({
    title: "",
    choice1: "",
    choice2: "",
    choice3: "",
    choice4: "",
  });
  const [nowQuestionidx, setnowQuestionidx] = useState(1);
  const [ExamQuestions, setExamQuestions] = useState([]);
  const [ExamAnswers, setExamAnswers] = useState([]);

  const [UserExamCode, setUserExamCode] = useState(""); // User가 방이름이랑 같이 입력할 코드
  const [UserDisabled, setUserDisabled] = useState(true);
  const [TotalQuestions, setTotalQuestions] = useState("");

  const [RadioValue, setRadioValue] = useState("");

  const [state, setState] = useState({
    mySessionId: "Room01",
    myUserName: "User" + Math.floor(Math.random() * 100),
    session: undefined,
    mainStreamManager: undefined,
    publisher: undefined,
    subscribers: [],
  });

  // 건드리지 말것
  const getToken = () => {
    return createSession(state.mySessionId).then((sessionId) =>
      createToken(sessionId)
    );
  };

  const createSession = (sessionId) => {
    return new Promise((resolve, reject) => {
      var data = JSON.stringify({ customSessionId: sessionId });
      axios
        .post(OPENVIDU_SERVER_URL + "/openvidu/api/sessions", data, {
          headers: {
            Authorization:
              "Basic " + btoa("OPENVIDUAPP:" + OPENVIDU_SERVER_SECRET),
            "Content-Type": "application/json",
          },
        })
        .then((response) => {
          console.log("CREATE SESION", response);
          resolve(response.data.id);
        })
        .catch((response) => {
          var error = Object.assign({}, response);
          if (error.response.status === 409) {
            resolve(sessionId);
          } else {
            console.log(error);
            console.warn(
              "No connection to OpenVidu Server. This may be a certificate error at " +
                OPENVIDU_SERVER_URL
            );
            if (
              window.confirm(
                'No connection to OpenVidu Server. This may be a certificate error at "' +
                  OPENVIDU_SERVER_URL +
                  '"\n\nClick OK to navigate and accept it. ' +
                  'If no certificate warning is shown, then check that your OpenVidu Server is up and running at "' +
                  OPENVIDU_SERVER_URL +
                  '"'
              )
            ) {
              window.location.assign(
                OPENVIDU_SERVER_URL + "/accept-certificate"
              );
            }
          }
        });
    });
  };

  const createToken = (sessionId) => {
    return new Promise((resolve, reject) => {
      var data = {};
      axios
        .post(
          OPENVIDU_SERVER_URL +
            "/openvidu/api/sessions/" +
            sessionId +
            "/connection",
          data,
          {
            headers: {
              Authorization:
                "Basic " + btoa("OPENVIDUAPP:" + OPENVIDU_SERVER_SECRET),
              "Content-Type": "application/json",
            },
          }
        )
        .then((response) => {
          console.log("TOKEN", response);
          resolve(response.data.token);
        })
        .catch((error) => reject(error));
    });
  };
  // 건드리지 말것

  // video 시작 코드
  const startVideo = () => {
    navigator.getUserMedia(
      { video: {} },
      (stream) => (videoRef.current.srcObject = stream),
      (err) => console.error(err)
    );
  };

  const startTest = async () => {
    if (test === 0) {
      document.querySelector("#startTest>span").innerHTML = "시험 종료";
      document.querySelector("#startTest").disabled = true;
      await startVideo();
      message
        .loading("Cam and Test Loading.. 잠시만 기다려 주세요...", 10)
        .then(() => {
          setTest(1);
          setTimer(1);
        });

      records = OV.initLocalRecorder(state.mainStreamManager["stream"]);
      records.record();

      startFaceApi();
      startObjectDetect();
      // startMyModel();
      // startRecognizeFaces();
      
    } else {
      state.session
        .signal({
          data: `${state.myUserName} 시험 종료`, // Any string (optional)
          to: connectionData, // Array of Connection objects (optional. Broadcast to everyone if empty)
          type: "endTest", // The type of message (optional)
        })
        .then(() => {
          setInital(2);
          console.log("메시지 전송 성공");
        })
        .catch((error) => {
          console.error(error);
        });
    }
  };

  const startDownload = async () => {
    // setTimer(0);
    document.querySelector("#startTest").disabled = false;
    clearInterval(faceapiInterval);
    clearInterval(objectdetectInterval);
    // clearInterval(sidefaceInterval);
    // clearInterval(faceReocogCheckInterval())
    await records.stop();
    blob = records.getBlob();
    uploadVideo();
  };

  const startFaceApi = () => {
    let checkFaceZero = 0;
    let checkFaceDouble = 0;
    let checkStart = 0;
    faceapiInterval = setInterval(async () => {
      const detections = await faceapi
        .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks();
      checkStart++;
      if (checkStart > 5) {
        if (detections.length === 0) {
          checkFaceZero++;
          if (checkFaceZero === 5) {
            // 메세지 보내기 code +
            state.session
              .signal({
                data: `${state.myUserName} Zero Face`, // Any string (optional)
                to: connectionData, // Array of Connection objects (optional. Broadcast to everyone if empty)
                type: "zeroFace", // The type of message (optional)
              })
              .then(() => {
                console.log("메시지 전송 성공");
              })
              .catch((error) => {
                console.error(error);
              });
            checkFaceZero = 0;
          }
        } else if (detections.length >= 2) {
          checkFaceDouble++;
          if (checkFaceDouble === 7) {
            //메세지 보내기 code +
            state.session
              .signal({
                data: `${state.myUserName} Too Many Face`, // Any string (optional)
                to: connectionData, // Array of Connection objects (optional. Broadcast to everyone if empty)
                type: "doubleFace", // The type of message (optional)
              })
              .then(() => {
                console.log("메시지 전송 성공");
              })
              .catch((error) => {
                console.error(error);
              });
            checkFaceDouble = 0;
          }
        } else {
          checkFaceZero = 0;
          checkFaceDouble = 0;
        }

        console.log("FaceApi", checkStart, detections);
      }
    }, 3000);
  };

  const startObjectDetect = async () => {
    let checkStart = 0;
    objectDetector = await ml5.objectDetector("cocossd");

    objectdetectInterval = setInterval(async () => {
      await objectDetector.detect(videoRef.current, function (err, results) {
        if (err) {
          console.log(err);
          return;
        }
        checkStart++;
        if (checkStart > 5) {
          console.log("ObjectDetection", checkStart, results);
          results.map((result, i) => {
            if (result["label"] === "cell phone") {
              // message 보내는 code +
              state.session
                .signal({
                  data: `${state.myUserName} Cell Phone Detect`, // Any string (optional)
                  to: connectionData, // Array of Connection objects (optional. Broadcast to everyone if empty)
                  type: "cellPhoneDetect", // The type of message (optional)
                })
                .then(() => {
                  console.log("메시지 전송 성공");
                })
                .catch((error) => {
                  console.error(error);
                });
            }
          });
        }
      });
    }, 3000);
  };

  const startMyModel = async () => {
    let checkStart = 0;
    let checkCount = 0;
    classifier = await ml5.imageClassifier(
      process.env.PUBLIC_URL + "/models/model.json",
      videoRef.current,
      (res) => {
        sidefaceInterval = setInterval(async () => {
          await classifier.classify(videoRef.current, (error, results) => {
            if (error) {
              console.error(error);
              return;
            }

            checkStart++;
            if (checkStart > 5) {
              console.log("MyModel", checkStart, results[0]);
              if (
                results[0].label !== "face" 
              // && results[0].confidence - results[1].confidence > 0.25
              ) {
                checkCount++;
                if (checkCount === 5) {
                  // 메세지 보내는 code +
                  state.session
                    .signal({
                      data: `${state.myUserName} Side Face Detect`, // Any string (optional)
                      to: connectionData, // Array of Connection objects (optional. Broadcast to everyone if empty)
                      type: "sideFaceDetect", // The type of message (optional)
                    })
                    .then(() => {
                      console.log("메시지 전송 성공");
                    })
                    .catch((error) => {
                      console.error(error);
                    });
                  checkCount = 0;
                }
              } else {
                checkCount = 0;
              }
            }
          });
        }, 3000);
      }
    );
  };

  const startRecognizeFaces = async () => {
    
    const labeledDescriptors = await loadLabeledImages();
    setTimeout(function () {
      let checkCount = 0;
      const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.6);
      faceReocogCheckInterval = setInterval(async () => {
        
        const detections = await faceapi
          .detectAllFaces(videoRef.current)
          .withFaceLandmarks()
          .withFaceDescriptors();
  
        const results = detections.map((d) => {
          return faceMatcher.findBestMatch(d.descriptor);
        });
  
        results.forEach((result, i) => {
          if (result.label !== userimage) {
            checkCount++;
            console.log(checkCount)
            if (checkCount === 5) {
              // 메세지 보내는 code +
              state.session
                .signal({
                  data: `${state.myUserName} User Miss Match`, // Any string (optional)
                  to: connectionData, // Array of Connection objects (optional. Broadcast to everyone if empty)
                  type: "missMatch", // The type of message (optional)
                })
                .then(() => {
                  console.log("메시지 전송 성공");
                })
                .catch((error) => {
                  console.error(error);
                });
              checkCount = 0;
            }
          } else {
            checkCount = 0;
          }
        });
      }, 3000);
    }, 10000);
  };

  const loadLabeledImages = () => {
    images.push(userimage)
    return Promise.all(
      images.map(async (label) => {
        console.log("label",label)
        const descriptions = [];
        const img = await faceapi.fetchImage(
          `https://server-jik.herokuapp.com/static${label}`
        );

        const detections = await faceapi
          .detectSingleFace(img)
          .withFaceLandmarks()
          .withFaceDescriptor();

        descriptions.push(detections.descriptor);
        return new faceapi.LabeledFaceDescriptors(label, descriptions);
      })
    );
  };

  const uploadVideo = () => {
    message.loading("Video Uploading...", 25);
    var fileKey =
      encodeURIComponent(albumName) +
      "/" +
      state.mySessionId +
      "/" +
      state.myUserName;
    s3.upload(
      {
        Key: fileKey,
        Body: blob,
        ACL: "public-read",
      },
      function (err, data) {
        if (err) {
          return message.error(`${err.message} error occured!!!`);
        }
        message.success("Upload Success!!!", 5);
      }
    );
  };

  const handleChangeSessionId = (e) => {
    setState({
      ...state,
      mySessionId: e.target.value,
    });
  };

  const handleChangeUserName = (e) => {
    setState({
      ...state,
      myUserName: e.target.value,
    });
  };

  const handleMainVideoStream = (stream) => {
    if (state.mainStreamManager !== stream) {
      setState({
        ...state,
        mainStreamManager: stream,
      });
    }
  };

  const deleteSubscriber = (streamManager) => {
    let subscribers = state.subscribers;
    let index = subscribers.indexOf(streamManager, 0);
    if (index > -1) {
      subscribers.splice(index, 1);
      setState({
        ...state,
        subscribers: subscribers,
      });
    }
  };

  const joinSession = async () => {
    if (UserExamCode !== String(ExamCode)) {
      alert("시험 코드가 잘못되었습니다 다시 확인해주세요.");
    } else {
      console.log("ExamId", ExamId);
      let body = {
        Exam_id: ExamId,
      };

      dispatch(FetchExam(body)).then((response) => {
        if (response.payload.fetchSuccess) {
          console.log("fetchExam: ", response.payload);
          var arr = response.payload.QuestionIdx;
          console.log("arr", arr);
          setTotalQuestions(arr.length * 10);
          for (let i = 0; i < arr.length; i++) {
            dispatch(FetchQuestions({ Question_id: arr[i] })).then(
              (response) => {
                console.log(response.payload);
                if (response.payload.fetchSuccess) {
                  console.log(response.payload);
                  ExamQuestions.push(response.payload.QuestionInfo);
                  ExamAnswers.push("");
                  if (i == 0) {
                    setnowQuestion({
                      title: ExamQuestions[0].title,
                      choice1: ExamQuestions[0].choice[0],
                      choice2: ExamQuestions[0].choice[1],
                      choice3: ExamQuestions[0].choice[2],
                      choice4: ExamQuestions[0].choice[3],
                    });
                    console.log("nodwQestion: ", nowQuestion);
                    userimage = (user.loginSuccess.user.image).substring(6)
                  }
                }
              }
            );
          }
         
          setRoomNo(1);
        } else {
          alert("Eaxm failed");
        }
      });
    }

    // --- 1) Get an OpenVidu object ---
    OV = await new OpenVidu();

    // --- 2) Init a session ---
    await setState({
      ...state,
      mySessionId: document.getElementById("basic_Room").value,
      myUserName: user.loginSuccess.user.name,
      session: await OV.initSession(),
    });
  };

  const afterCreateSession = () => {
    var mySession = state.session;
    // --- 3) Specify the actions when events take place in the session ---
    // On every new Stream received...

    mySession.on("connectionCreated", async (event) => {
      if (
        state.myUserName === "User" &&
        event.connection.remoteOptions !== undefined
      ) {
        await connectionData.push(event.connection);
      } else {
        if (
          event.connection.remoteOptions !== undefined &&
          event.connection.remoteOptions["metadata"].substring(
            15,
            event.connection.remoteOptions["metadata"].length - 2
          ) === "User"
        ) {
          await connectionData.push(event.connection);
        }
      }
    });

    mySession.on("streamCreated", (event) => {
      // Subscribe to the Stream to receive it. Second parameter is undefined
      // so OpenVidu doesn't create an HTML video by its own
      var subscriber = mySession.subscribe(event.stream, undefined);

      var subscribers = state.subscribers;
      subscribers.push(subscriber);

      // Update the state with the new subscribers
      setState({
        ...state,
        subscribers: subscribers,
      });
    });

    // On every Stream destroyed...
    mySession.on("streamDestroyed", (event) => {
      // Remove the stream from 'subscribers'
      deleteSubscriber(event.stream.streamManager);
    });

    mySession.on("signal:zeroFace", (event) => {
      const key = `open${Date.now()}`;
      const btn = (
        <Button
          type="primary"
          size="small"
          onClick={() => notification.close(key)}
        >
          Confirm
        </Button>
      );
      notification.open({
        message: "Zero Face",
        description: event.data,
        btn,
        key,
        onClose: () => {
          console.log("Close");
        },
      });
    });

    mySession.on("signal:doubleFace", (event) => {
      const key = `open${Date.now()}`;
      const btn = (
        <Button
          type="primary"
          size="small"
          onClick={() => notification.close(key)}
        >
          Confirm
        </Button>
      );
      notification.open({
        message: "Double Face",
        description: event.data,
        btn,
        key,
        onClose: () => {
          console.log("Close");
        },
      });
    });

    mySession.on("signal:cellPhoneDetect", (event) => {
      const key = `open${Date.now()}`;
      const btn = (
        <Button
          type="primary"
          size="small"
          onClick={() => notification.close(key)}
        >
          Confirm
        </Button>
      );
      notification.open({
        message: "Cell Phone Detect",
        description: event.data,
        btn,
        key,
        onClose: () => {
          console.log("Close");
        },
      });
    });

    mySession.on("signal:sideFaceDetect", (event) => {
      const key = `open${Date.now()}`;
      const btn = (
        <Button
          type="primary"
          size="small"
          onClick={() => notification.close(key)}
        >
          Confirm
        </Button>
      );
      notification.open({
        message: "Side Face Detect",
        description: event.data,
        btn,
        key,
        onClose: () => {
          console.log("Close");
        },
      });
    });

    mySession.on("signal:missMatch", (event) => {
      const key = `open${Date.now()}`;
      const btn = (
        <Button
          type="primary"
          size="small"
          onClick={() => notification.close(key)}
        >
          Confirm
        </Button>
      );
      notification.open({
        message: "User Miss Match",
        description: event.data,
        btn,
        key,
        onClose: () => {
          console.log("Close");
        },
      });
    });

    mySession.on("signal:endTest", (event) => {
      const key = `open${Date.now()}`;
      const btn = (
        <Button
          type="primary"
          size="small"
          onClick={() => notification.close(key)}
        >
          Confirm
        </Button>
      );
      notification.open({
        message: "시험 종료 알림",
        description: event.data,
        btn,
        key,
        onClose: () => {
          console.log("Close");
        },
      });
    });

    // --- 4) Connect to the session with a valid user token ---
    // 'getToken' method is simulating what your server-side should do.
    // 'token' parameter should be retrieved and returned by your own backend

    getToken().then((token) => {
      // First param is the token got from OpenVidu Server. Second param can be retrieved by every user on event
      // 'streamCreated' (property Stream.connection.data), and will be appended to DOM as the user's nickname
      mySession.connect(token, { clientData: state.myUserName }).then(() => {
        // --- 5) Get your own camera stream ---
        // Init a publisher passing undefined as targetElement (we don't want OpenVidu to insert a video
        // element: we will manage it on our own) and with the desired properties
        if (state.myUserName !== "User") {
          let publisher = OV.initPublisher(undefined, {
            audioSource: undefined, // The source of audio. If undefined default microphone
            videoSource: "screen", // The source of video. If undefined default webcam
            publishAudio: true, // Whether you want to start publishing with your audio unmuted or not
            publishVideo: true, // Whether you want to start publishing with your video enabled or not
            resolution: "640x480", // The resolution of your video
            frameRate: 30, // The frame rate of your video
            insertMode: "APPEND", // How the video is inserted in the target element 'video-container'
            mirror: false, // Whether to mirror your local video or not
          });

          // --- 6) Publish your stream ---
          mySession.publish(publisher);

          // Set the main video in the page to display our webcam and store our Publisher
          setState({
            mySessionId: state.mySessionId,
            myUserName: state.myUserName,
            session: state.session,
            mainStreamManager: publisher,
            publisher: publisher,
            subscribers: state.subscribers,
          });
        }
      });
    });
  };

  const leaveSession = () => {
    // --- 7) Leave the session by calling 'disconnect' method over the Session object ---
    if (state.session) {
      state.session.disconnect();
    }

    // Empty all properties...
    OV = null;
    setState({
      session: undefined,
      subscribers: [],
      mySessionId: "Room01",
      myUserName: "User" + Math.floor(Math.random() * 100),
      mainStreamManager: undefined,
      publisher: undefined,
    });
  };

  const leaveTest = () => {
    leaveSession();
    setInital(1);
  };

  useEffect(async () => {
    console.log(state);
    if (state.session !== undefined) {
      await afterCreateSession();
    }
  }, [state.session]);

  useEffect(() => {
    const MODEL_URL = process.env.PUBLIC_URL + "/models";
    Promise.all([
      faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
    ]).then(() => {
      leaveSession();
      setInital(1);
    });
  }, []);

  const onUserExamCode = (event) => {
    setUserExamCode(event.currentTarget.value);
  };

  const onExamIdHandler = (event) => {
    setExamId(event.currentTarget.value);
  };

  function onChangeHandler(checkedValues) {
    setRadioValue(checkedValues.target.value);
    ExamAnswers[nowQuestionidx - 1] = checkedValues.target.value;
  }

  function onChangeQuestions(Numbers) {
    setnowQuestionidx(Numbers);
    setnowQuestion({
      title: ExamQuestions[Numbers - 1].title,
      choice1: ExamQuestions[Numbers - 1].choice[0],
      choice2: ExamQuestions[Numbers - 1].choice[1],
      choice3: ExamQuestions[Numbers - 1].choice[2],
      choice4: ExamQuestions[Numbers - 1].choice[3],
    });

    if (ExamAnswers[Numbers - 1] === "") {
      setRadioValue("");
    } else {
      setRadioValue(ExamAnswers[Numbers - 1]);
    }
  }
  const onSearch = (value) => {
    ExamId = value;
    setExamId(value);
    dispatch(FetchExam({ Exam_id: ExamId })).then((response) => {
      if (response.payload.fetchSuccess) {
        setExamCode(response.payload.Exam_code);
        if (user.loginSuccess && user.loginSuccess.user.role === 1) {
          console.log(response.payload.fetchSuccess);
          alert(`${value}시험의 방 코드 500586를 응시자에게 알려주세요.`);
        } else {
          alert(`${value}시험의 방 코드를 입력하세요.`);
          setUserDisabled(false);
        }
      } else {
        alert(`${value} 이름을 가진 시험이 없습니다.`);
      }
    });
  };
  // submit
  const onSubmitHandler = (event) => {
    // 계속 새로고침 방지
    event.preventDefault();
    let body = {
      Exam_id: ExamId,
    };

    dispatch(FetchExam(body)).then((response) => {
      if (response.payload.fetchSuccess) {
        var arr = response.payload.QuestionIdx;
        setTotalQuestions(arr.length * 10);
        for (let i = 0; i < arr.length; i++) {
          dispatch(FetchQuestions({ Question_id: arr[i] })).then((response) => {
            if (response.payload.fetchSuccess) {
              ExamQuestions.push(response.payload.QuestionInfo);
              ExamAnswers.push("");
              console.log(ExamQuestions);
              console.log(ExamAnswers);
              if (i === 0) {
                setnowQuestion({
                  title: ExamQuestions[0].title,
                  choice1: ExamQuestions[0].choice[0],
                  choice2: ExamQuestions[0].choice[1],
                  choice3: ExamQuestions[0].choice[2],
                  choice4: ExamQuestions[0].choice[3],
                });
                console.log(nowQuestion);
              }
            }
          });
        }
        setRoomNo(1);
      } else {
        alert("Eaxm failed");
      }
    });
  };

  const onEndExamHandler = (event) => {
    // 계속 새로고침 방지
    event.preventDefault();

    let cnt = 0;
    let missing = [];

    for (let i = 0; i < ExamAnswers.length; i++) {
      if (ExamAnswers[i] == "") {
        cnt++;
        missing.push(i + 1);
      }
    }
    if (cnt !== 0) {
      alert(`${missing} 번을 아직 풀지 않았습니다.`);
    } else {
      correct = 0;
      for (let i = 0; i < ExamAnswers.length; i++) {
        if (ExamAnswers[i] == ExamQuestions[i].correct_idx) {
          correct++;
        }
      }
      score = (correct / ExamQuestions.length) * 100;
      setTimer(0);
      setTest(10);
      alert("영상 제출 버튼을 눌러 영상을 제출하고 점수를 확인하세요.");
    }
  };

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

  if (initial === 0) {
    return <Spin className="beforeTest" tip="Model Loading..."></Spin>;
  } else if (initial === 1 && state.session === undefined) {
    return (
      <div className="beforeTest">
        <Form
          name="basic"
          initialValues={{
            remember: true,
          }}
          onFinish={joinSession}
        >
          <Form.Item
            id="Room"
            label="Room"
            name="Room"
            initialValue={state.mySessionId}
            rules={[
              {
                required: true,
                message: "Please input RoomNumber!",
              },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item label="Exam Name">
            <Search placeholder="Input Exam Name" onSearch={onSearch} />
          </Form.Item>
          <Form.Item label="Exam Code">
            <Input
              size="large"
              placeholder="ExamCode"
              value={UserExamCode}
              onChange={onUserExamCode}
              disabled={UserDisabled}
            />
          </Form.Item>

          <Form.Item label="User">
            <Input
              size="large"
              placeholder={user.loginSuccess.user.name}
              prefix={<UserOutlined />}
              disabled={true}
            />
          </Form.Item>

          <Form.Item {...tailLayout}>
            <Button type="primary" shape="round" htmlType="submit">
              JOIN
            </Button>
          </Form.Item>
        </Form>
      </div>
    );
  } else if (
    initial === 1 &&
    state.session !== undefined &&
    user.loginSuccess.user.role === 1
  ) {
    return (
      <Layout>
        <Sider theme={"light"} width={"22vw"}>
          <PageHeader
            onBack={leaveSession}
            title={state.mySessionId}
            subTitle={state.myUserName}
          />
          <hr />
          <div>접속 중인 사용자</div>
          <hr />
          <List
            itemLayout="horizontal"
            dataSource={state.subscribers}
            renderItem={(item) => (
              <div>
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar size={50}>USER</Avatar>}
                    title={item["stream"]["connection"]["data"].substring(
                      15,
                      item["stream"]["connection"]["data"].length - 2
                    )}
                    description="시험 방에 입장했습니다."
                  />
                </List.Item>
                <hr />
              </div>
            )}
          />
        </Sider>
        <Content>
          <div id="video-container">
            {state.subscribers.map((sub, i) => (
              <div
                key={i}
                className="stream-container"
                onClick={() => handleMainVideoStream(sub)}
              >
                <UserVideoComponent streamManager={sub} />
              </div>
            ))}
          </div>
        </Content>
        <Sider theme={"light"} width={"12vw"}>
          <iframe
            src="https://service.dongledongle.com/developjik"
            title="chat"
            width="100%"
            height="600"
          ></iframe>
        </Sider>
      </Layout>
    );
  } else if (
    initial === 1 &&
    state.session !== undefined &&
    user.loginSuccess.user.role === 0
  ) {
    return (
      <Layout>
        <Sider theme={"light"} width={"22vw"}>
          <PageHeader
            onBack={leaveSession}
            title={state.mySessionId}
            subTitle={state.myUserName}
          />
          <hr />
          {timer === 0 ? null : (
            <div>
              <Countdown
                title="Countdown"
                value={Date.now() + 1000 * 60 * 60 + 30 * 1000}
                onFinish={leaveTest}
              />
              <hr />
            </div>
          )}
          <video id="video" ref={videoRef} autoPlay />
        </Sider>
        <Content>
          {timer === 0 ? null : (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
                height: "50vh",
              }}
            >
              <form style={{ display: "flex", flexDirection: "column" }}>
                <Radio.Group
                  style={{
                    display: "block",
                    height: "30px",
                    lineHeight: "30px",
                  }}
                  value={RadioValue}
                  onChange={onChangeHandler}
                >
                  <Row gutter={[0, 24]}>
                    <Col span={100}>
                      <Title level={2}>Q. {nowQuestion.title}</Title>
                    </Col>
                  </Row>
                  <Row gutter={[0, 24]}>
                    <Col span={24}>
                      <Radio value="1">{nowQuestion.choice1}</Radio>
                    </Col>
                  </Row>
                  <Row gutter={[0, 24]}>
                    <Col span={100}>
                      <Radio value="2">{nowQuestion.choice2}</Radio>
                    </Col>
                  </Row>
                  <Row gutter={[0, 24]}>
                    <Col span={100}>
                      <Radio value="3">{nowQuestion.choice3}</Radio>
                    </Col>
                  </Row>
                  <Row gutter={[0, 24]}>
                    <Col span={100}>
                      <Radio value="4">{nowQuestion.choice4}</Radio>
                    </Col>
                  </Row>
                  <Row gutter={[0, 24]}>
                    <Col span={100}>
                      <Pagination
                        simple
                        total={TotalQuestions}
                        current={nowQuestionidx}
                        onChange={onChangeQuestions}
                      />
                    </Col>
                  </Row>
                  <Row gutter={[0, 24]}>
                    <Col span={100}>
                      <Button
                        id="testendBtn"
                        type="primary"
                        shape="round"
                        icon={<RightSquareOutlined />}
                        size={"large"}
                        htmlType="submitTe"
                        onClick={onEndExamHandler}
                      >
                        시험 제출
                      </Button>
                    </Col>
                  </Row>
                </Radio.Group>
              </form>
            </div>
          )}
        </Content>
        <Sider theme={"light"} width={"12vw"}>
          <div id="button">
            <Button
              id="startTest"
              type="primary"
              shape="round"
              onClick={startTest}
              style={{ margin: "0.5vh" }}
            >
              시험 시작
            </Button>
            <Button
              id="startDownload"
              type="primary"
              shape="round"
              onClick={startDownload}
              style={{ margin: "0.5vh" }}
            >
              영상 제출
            </Button>
          </div>
          <hr />
          <iframe
            src="https://service.dongledongle.com/developjik"
            title="chat"
            width="100%"
          ></iframe>
        </Sider>
      </Layout>
    );
  } else if (initial === 2) {
    return (
      <div
        
      >
        <Result
          status="success"
          title="시험 종료"
          extra={[
            <Button type="primary" key="console" onClick={leaveTest}>
              <a href="/">Home</a>
            </Button>,
          ]}
        />
        <div style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: "large"
        }}>
           {score}점 {ExamQuestions.length}문제 중에 {correct}문제 맞췄습니다.
        </div>
       
      </div>
    );
  }
}

export default withRouter(JoinRoomPage);
