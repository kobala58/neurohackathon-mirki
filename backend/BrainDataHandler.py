import psycopg2
from psycopg2.extras import execute_batch
from datetime import datetime
from typing import List, Dict
import logging


class BrainDataHandler:
    def __init__(
        self,
        host: str = "localhost",
        port: int = 5432,
        database: str = "braindata",
        user: str = "user",
        password: str = "password",
    ):
        """Initialize database connection"""
        self.conn_params = {
            "host": host,
            "port": port,
            "database": database,
            "user": user,
            "password": password,
        }
        self.conn = None
        self.setup_logging()
        # Połączenie przy inicjalizacji
        self.connect()

    def setup_logging(self):
        """Set up logging configuration"""
        logging.basicConfig(
            level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
        )
        self.logger = logging.getLogger(__name__)

    def ensure_connection(self):
        """Ensure database connection exists and is valid"""
        try:
            if self.conn is None or self.conn.closed:
                self.connect()
        except Exception as e:
            self.logger.error(f"Error checking connection: {e}")
            self.connect()

    def connect(self):
        """Establish database connection"""
        try:
            self.conn = psycopg2.connect(**self.conn_params)
            self.logger.info("Successfully connected to the database")
        except Exception as e:
            self.logger.error(f"Error connecting to database: {e}")
            raise

    def disconnect(self):
        """Close database connection"""
        if self.conn and not self.conn.closed:
            self.conn.close()
            self.conn = None
            self.logger.info("Database connection closed")

    def insert_engagement(
        self,
        timestamp: datetime,
        coef_min: float,
        coef_max: float,
        coef_avg: float,
        is_focused: bool,
    ):
        """Insert single engagement record"""
        self.ensure_connection()
        try:
            with self.conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO engagement (timestamp, coef_min, coef_max, coef_avg, is_focused)
                    VALUES (%s, %s, %s, %s, %s)
                    RETURNING id
                """,
                    (timestamp, coef_min, coef_max, coef_avg, is_focused),
                )
                record_id = cur.fetchone()[0]
                self.conn.commit()
                self.logger.info(f"Inserted engagement record with id {record_id}")
                return record_id
        except Exception as e:
            if self.conn and not self.conn.closed:
                self.conn.rollback()
            self.logger.error(f"Error inserting engagement data: {e}")
            raise

    def insert_raw_data(
        self,
        timestamp: datetime,
        f4: float,
        f3: float,
        c4: float,
        c3: float,
        p4: float,
        p3: float,
        o1: float,
        o2: float,
    ):
        """Insert single raw data record"""
        self.ensure_connection()
        try:
            with self.conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO raw_data (timestamp, f4, f3, c4, c3, p4, p3, o1, o2)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                    RETURNING id
                """,
                    (timestamp, f4, f3, c4, c3, p4, p3, o1, o2),
                )
                record_id = cur.fetchone()[0]
                self.conn.commit()
                self.logger.info(f"Inserted raw data record with id {record_id}")
                return record_id
        except Exception as e:
            if self.conn and not self.conn.closed:
                self.conn.rollback()
            self.logger.error(f"Error inserting raw data: {e}")
            raise

    def batch_insert_raw_data(self, data_list: List[Dict]):
        """Insert multiple raw data records efficiently"""
        self.ensure_connection()
        try:
            with self.conn.cursor() as cur:
                execute_batch(
                    cur,
                    """
                    INSERT INTO raw_data (timestamp, f4, f3, c4, c3, p4, p3, o1, o2)
                    VALUES (%(timestamp)s, %(f4)s, %(f3)s, %(c4)s, %(c3)s, 
                            %(p4)s, %(p3)s, %(o1)s, %(o2)s)
                """,
                    data_list,
                )
                self.conn.commit()
                self.logger.info(f"Inserted {len(data_list)} raw data records")
        except Exception as e:
            if self.conn and not self.conn.closed:
                self.conn.rollback()
            self.logger.error(f"Error batch inserting raw data: {e}")
            raise

    def get_engagement_data(
        self, start_time: datetime = None, end_time: datetime = None
    ) -> List[Dict]:
        """Retrieve engagement data within time range"""
        self.ensure_connection()
        try:
            with self.conn.cursor() as cur:
                query = """
                    SELECT timestamp, coef_min, coef_max, coef_avg, is_focused 
                    FROM engagement
                """
                params = []
                if start_time and end_time:
                    query += " WHERE timestamp BETWEEN %s AND %s"
                    params = [start_time, end_time]

                cur.execute(query, params)
                columns = [desc[0] for desc in cur.description]
                results = [dict(zip(columns, row)) for row in cur.fetchall()]
                self.logger.info(f"Retrieved {len(results)} engagement records")
                return results
        except Exception as e:
            self.logger.error(f"Error retrieving engagement data: {e}")
            raise

    def get_raw_data(
        self, start_time: datetime = None, end_time: datetime = None
    ) -> List[Dict]:
        """Retrieve raw data within time range"""
        self.ensure_connection()
        try:
            with self.conn.cursor() as cur:
                query = """
                    SELECT timestamp, f4, f3, c4, c3, p4, p3, o1, o2 
                    FROM raw_data
                """
                params = []
                if start_time and end_time:
                    query += " WHERE timestamp BETWEEN %s AND %s"
                    params = [start_time, end_time]

                cur.execute(query, params)
                columns = [desc[0] for desc in cur.description]
                results = [dict(zip(columns, row)) for row in cur.fetchall()]
                self.logger.info(f"Retrieved {len(results)} raw data records")
                return results
        except Exception as e:
            self.logger.error(f"Error retrieving raw data: {e}")
            raise

    def __enter__(self):
        """Context manager enter"""
        self.ensure_connection()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit"""
        self.disconnect()