# ExamY

## 👋 ExamY 소개

- 온라인 시험 감독 서비스 제공을 위한 `시험 제작`, `자동 부정행위를 감지`하는 웹 어플리케이션입니다.
- 시험 제작 : 관리자는 시험 문제집을 제작할 수 있고, 시험을 개설할 수 있습니다.
- 자동 부정행위 감지 : Pre-trained 모델을 활용하여 사용자의 부정행위를 자동 감지할 수 있습니다.

## 🔨 기술 스택

<p align='center'>
    <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white"/>
     <img src="https://img.shields.io/badge/Express.js-404D59?style=for-the-badge"/>
      <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB"/>
    <img src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white"/>
    <img src="https://img.shields.io/badge/Heroku-430098?style=for-the-badge&logo=heroku&logoColor=white"/>
</p>

## 🏛 프로젝트 아키텍처

![image](https://user-images.githubusercontent.com/48426909/134015147-dbef766c-48f6-4f5a-a39f-7b913c8c2a21.png)

### API URI

| 번호 | 유형 | URI                         | 설명                                                |
| :--- | :--- | :-------------------------- | :-------------------------------------------------- |
| 1    | POST | /api/users/login            | 입력한 이메일&비밀번호를 기준으로 로그인 요청       |
| 2    | GET  | /api/users/logout           | 현재 로그인 된 유저를 로그아웃 요청                 |
| 3    | POST | /api/users/register         | 유저 정보를 기반으로 회원가입 요청                  |
| 4    | GET  | /api/users/auth             | 지금 로그인된 현재 유저의 인증 정보를 요청          |
| 5    | POST | /api/users/upload/userimage | 유저의 얼굴 이미지를 따로 DB에 저장 요청            |
| 6    | POST | /api/test/upload/question   | 관리자가 제작한 문제들 DB에 저장 요청               |
| 7    | POST | /api/test/maketest          | 제작된 문제들을 바탕으로 DB에 시험 정보를 저장 요청 |
| 8    | POST | /api/room/fetch/exam        | Exam Code를 기준으로 시험의 정보들을 가져오는 요청  |
| 9    | POST | /api/room/fetch/questions   | Exam Code를 기준으로 시험의 문제들을 가져오는 요청  |

### 기타사항

- 현재 heroku, mongoDB 연동 문제로 인해 실제 데모는 작동하지 않는 이슈가 있습니다.
- [데모영상](https://www.youtube.com/watch?v=8XiyuhnKvyE)
