#!/usr/bin/env python3
"""
簡単にtest.dbにデータを追加するスクリプト
"""

import random

import sqlite3
from datetime import datetime, timedelta


conn = sqlite3.connect("test.db")
cursor = conn.cursor()


def add_user_data(
    email: str,
    username: str,
    date_of_birth: datetime,
    sex: bool,
    height: float,
):
    cursor.execute(
        """
        INSERT INTO users (email, username, date_of_birth, sex, height)
        VALUES (?, ?, ?, ?, ?)
        """,
        (email, username, date_of_birth, sex, height),
    )
    user_id = cursor.lastrowid
    print(f"Added user: {user_id}")

    conn.commit()


def add_users_data():
    for i in range(1000):
        year = random.randint(10, 80)

        add_user_data(
            email=f"test{i}@example.com",
            username=f"test{i}",
            date_of_birth=datetime.now() - timedelta(days=365 * year),
            sex=random.choice([True, False]),
            height=random.uniform(140, 195),
        )


def add_vital_data(
    date: datetime,
    name_id: int,
    value: float,
    user_id: int,
):
    cursor.execute(
        """
        INSERT INTO vitaldata (date, name_id, value, user_id)
        VALUES (?, ?, ?, ?)
        """,
        (date, name_id, value, user_id),
    )
    vital_id = cursor.lastrowid
    print(f"Added vital: {vital_id}")

    conn.commit()


def add_vitals_data():
    for i in range(9, 1010):
        cursor.execute("SELECT date_of_birth, sex, height FROM users WHERE id = ?", (i,))
        users = cursor.fetchall()
        date_of_birth, sex, height = users[0]
        age = (datetime.now() - datetime.fromisoformat(date_of_birth)).days / 365
        correction = -((age - 40) ** 2) / 160 - (age - 40) / 5
        weight = random.uniform(15, 45) * height * height / 10000 if sex else random.uniform(10, 40) * height * height / 10000
        for j in range(100):
            add_vital_data(
                date=datetime.now() - timedelta(days=j),
                name_id=1,
                value=weight + correction,
                user_id=i,
            )
            add_vital_data(
                date=datetime.now() - timedelta(hours=j * 6),
                name_id=3,
                value=random.uniform(200, 20000) + correction**2,
                user_id=i,
            )


def add_vital_category():
    for i in range(10, 1010):
        cursor.execute(
            """
            INSERT INTO uservitalcategory (user_id, vital_id, is_public, is_accumulating)
            VALUES (?, ?, ?, ?)
            """,
            (i, 1, True, False),
        )
        vital_id = cursor.lastrowid
        print(f"Added vital: {vital_id}")

        cursor.execute(
            """
            INSERT INTO uservitalcategory (user_id, vital_id, is_public, is_accumulating)
            VALUES (?, ?, ?, ?)
            """,
            (i, 3, True, True),
        )
        vital_id = cursor.lastrowid
        print(f"Added vital: {vital_id}")

        conn.commit()


def view_data():
    conn = sqlite3.connect("test.db")
    cursor = conn.cursor()

    cursor.execute("SELECT id, email, username, sex FROM users")
    users = cursor.fetchall()
    print(f"ユーザー数: {len(users)}")
    for user in users:
        print(f"  ID: {user[0]}, メール: {user[1]}, ユーザー名: {user[2]}, 性別: {user[3]}")

    conn.close()


if __name__ == "__main__":
    view_data()

    # add_users_data()
    # add_vitals_data()
    add_vital_category()

    conn.close()
