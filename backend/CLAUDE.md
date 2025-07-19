英語で思考、推論して、ユーザーへの出力は日本語で行ってください。

## Endpoints

- login/
    - 入力: str
- one-time/
    - 入力: str
    - 出力:
    
    ```jsx
    //JWT認証
    {
    	"acccess_token": access_token, 
    	"token_type": "bearer"
    }
    ```
    
- profile/
    - 入力: user id
    - 出力:
        
        ```jsx
        //プロフィール情報
        {
        	"icon": 画像データ,
        	"username": str: User.username, 
        	"date_of_birth": Datetime: User.date_of_birth, 
        	"height": Vitaldata.value["height"], 
        	"sex": Bool: User.sex,
        }
        
        ```
        
- objectives/
    - 入力: user_id
    - 出力:
        
        ```jsx
        //目標情報
        [
        	{
        		"objective_id": objective_id,
        		"start_date": Datatime,
        		"end_date": Datatime, 
        		"my_value": float: Objective.value,
        		"data_name": str: VitalDataName.name,
        		"friends": {"friend_icon": 画像データ,
        								"friend_info": float: フレンドの値, },
        	},
        	...
        ]
        ```
        
- life-logs/
    - 入力: user_id
    - 出力:
        
        ```jsx
        //ライフログ
        [
        	{
        		"data_name": str: VitalDataName.name,
        		"is_public": bool: VitalData.is_public,
        		"register_date": Datatime: VitalData.date,
        		"graph": グラフデータ, 
        	},
        
        ...
        ]
        ```
        
- settings/
    - 入力: user_id
    - 出力:
        
        ```jsx
        {
        	"icon": 画像データ,
        	"adress": str: User.email,
        	"username": str: User.username, 
        	"height": float?: Vitaldata.value["height"], 
        }
        ```
        
- add_objective_list/
    - 入力: user_id
    - 出力:
        
        ```jsx
        {
        	"objective_name": str: VitalDataName.name,
        }
        ```
        
- add_log_list/
    - 入力: user_id
    - 出力:
        
        ```jsx
        {
        	"vital_data": str: VitalDataName.name,
        }
        ```
        
- 
- friends (get all friends)
    - 入力:token
    - 出力:
        
        ```json
        //フレンド一覧
        [
          {
            "user_id": int: User.id,
            "username": str: User.username,
            "icon": 画像データ,
            "latest_step": float: VitalData.value["steps"], 
          },
          ...
        ```
        
- friends/{user_id}
    - user_id
    - 出力:
        
        ```json
        //フレンド詳細
        {
          "user_id": int,
          "username": str: User.username,
          "age": int,  // 計算された値（誕生日から）
          "sex": bool: User.sex,
          "latest_data": [
            {
              "data_name": str: VitalDataName.name,
              "value": float: VitalData.value,
              "date": Datetime: VitalData.date
            },
            ...
          ]
        }
        ```
        
- objectives/{user_id}
    - 入力:user_id
    - 出力:
        
        ```json
        //目標情報
        [
          {
            "objective_id": int: Objective.id,
            "data_name": str: VitalDataName.name,
            "start_date": Datetime: Objective.start,
            "end_date": Datetime: Objective.end,
            "my_value": float: Objective.objective_value,
            "friends": [
              {
                "friend_icon": 画像データ,
                "friend_info": float: フレンドの同じデータ値（例：歩数など）
              },
              ...
            ]
          },
          ...
        ]
        ```
        
- friends/add
    - 入力:
    - 出力:
        
        ```json
        {
          "message": "Friend added successfully"
        }
        ```
        
- user/qrcode
    - 入力:
    - 出力:
- vitaldata/me
    - 入力:
    - 出力:
        
        ```json
        [
          { "name": "steps", "value": 8000, "date": "2025-06-23" },
          { "name": "heart_rate", "value": 70, "date": "2025-06-23" },
          ...
        ]
        ```
        
- vitaldata/statistics
    - 入力:`vital_name`, `age_group?`, `sex?`
    - 出力:
        
        ```json
        {
          "average": 7200,
          "your_value": 8400,
          "percentile": 80
        }
        ```
        
- objectives （自分の目標一覧）
    - 入力:
    - 出力:
        
        ```json
        [
          {
            "id": 1,
            "name": "steps",
            "start": "2025-06-01",
            "end": "2025-06-30",
            "objective_value": 100000,
            "progress": 50000
          },
          ...
        ]
        ```
        
- objectives  (set objectives)
    - 入力:
        
        ```json
        //目標情報一覧
        [
          {
            "objective_id": int,
            "data_name": str: VitalDataName.name,
            "start_date": Datetime,
            "end_date": Datetime,
            "my_value": float: Objective.objective_value,
            "progress": float: 現在の達成量
          },
          ...
        ]
        
        ```
        
    - 出力:
        
        ```json
        {
          "id": 10,
          "message": "Objective created"
        }
        ```
        
- objectives/{id}  (update objective)
    - 入力:
        
        ```json
        {
          "objective_value": 120000
        }
        ```
        
    - 出力:
        
        ```json
        {
          "message": "Objective updated"
        }
        ```
        
- objectives/{id} (delete objective)
    - 入力:
        
        ```json
        objective_id
        ```
        
    - 出力:
        
        ```json
        {
          "message": "Objective deleted"
        }
        ```
        
- chat
    - 入力:
        - message: string
    - 出力::
        - reply: string