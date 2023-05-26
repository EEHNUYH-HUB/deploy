module.exports = {
    apps: [
        {
            name: 'mainapi', // pm2 name
            script: './app.js', // // 앱 실행 스크립트
            instances: 1, // 클러스터 모드 사용 시 생성할 인스턴스 수
            exec_mode: 'fork', // fork, cluster 모드 중 선택
            merge_logs: true, // 클러스터 모드 사용 시 각 클러스터에서 생성되는 로그를 한 파일로 합쳐준다.
            autorestart: true, // 프로세스 실패 시 자동으로 재시작할지 선택
            watch: true, // 파일이 변경되었을 때 재시작 할지 선택
            // max_memory_restart: "512M", // 프로그램의 메모리 크기가 일정 크기 이상이 되면 재시작한다.
            env: {
                // 개발 환경설정
                NODE_ENV: 'development',
                LISTENPORT: 9000,

            },
            env_mssql: {
                // 운영 환경설정 (--env production 옵션으로 지정할 수 있다.)
                NODE_ENV: 'development_mssql',
                DBHOST: "40.82.153.85",
                DBNAME: "TEST",
                DBUSER: "sa",
                DBPASSWORD: "P@ssw0rd",
                DBPORT: "1433",
                DBTYPE: "MSSQL",
            },
            env_postgresql: {
                // 운영 환경설정 (--env production 옵션으로 지정할 수 있다.)
                NODE_ENV: 'development_postgresql',
                DBHOST: "jmfc.eehnuyh.com",
                DBNAME: "JMFC",
                DBUSER: "postgres",
                DBPASSWORD: "************",
                DBPORT: 5432,
                DBTYPE: "POSTGRESQL",
            }
        }
    ]
}; 
