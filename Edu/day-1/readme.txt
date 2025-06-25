# 가상환경 생성
conda create --name [name] python==3.12.4
conda activate [name]

# CD 명령으로 requirements.txt 가 있는 폴더로 이동
# 패키지 설치
pip install -r requirements.txt



# 참고
# 가상환경 삭제
conda remove --name [name] --all