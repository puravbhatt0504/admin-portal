from sqlalchemy import Column, Integer, String, Float, Date, Time, Text
from sqlalchemy.orm import declarative_base

# This is the base class that our models will inherit from
Base = declarative_base()

class Employee(Base):
    __tablename__ = "employees"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), unique=True, nullable=False, index=True)

class Attendance(Base):
    __tablename__ = "attendance"
    id = Column(Integer, primary_key=True, index=True)
    employee_name = Column(String(255), nullable=False, index=True)
    date = Column(Date, nullable=False, index=True)
    shift1_in = Column(Time, nullable=True)
    shift1_out = Column(Time, nullable=True)
    shift2_in = Column(Time, nullable=True)
    shift2_out = Column(Time, nullable=True)

class TravelExpense(Base):
    __tablename__ = "travel_expenses"
    id = Column(Integer, primary_key=True, index=True)
    employee_name = Column(String(255), nullable=False, index=True)
    date = Column(Date, nullable=False, index=True)
    start_reading = Column(Float, nullable=True)
    end_reading = Column(Float, nullable=True)
    distance = Column(Float, nullable=True)
    rate = Column(Float, nullable=True)
    amount = Column(Float, nullable=False)

class GeneralExpense(Base):
    __tablename__ = "general_expenses"
    id = Column(Integer, primary_key=True, index=True)
    employee_name = Column(String(255), nullable=False, index=True)
    date = Column(Date, nullable=False, index=True)
    description = Column(Text, nullable=True)
    amount = Column(Float, nullable=False)

class Advance(Base):
    __tablename__ = "advances"
    id = Column(Integer, primary_key=True, index=True)
    employee_name = Column(String(255), nullable=False, index=True)
    date = Column(Date, nullable=False, index=True)
    amount = Column(Float, nullable=False)
    notes = Column(Text, nullable=True)

