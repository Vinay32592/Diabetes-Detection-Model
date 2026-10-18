"""
Exploratory Data Analysis (EDA) Script for Pima Indians Diabetes Dataset
Generates comprehensive statistical summaries, feature correlations, and biomarker distributions.
"""

import os
import pandas as pd
import numpy as np

DATA_PATH = os.path.join(os.path.dirname(__file__), "data", "diabetes.csv")

def run_eda():
    if not os.path.exists(DATA_PATH):
        print(f"Dataset not found at {DATA_PATH}")
        return

    df = pd.read_csv(DATA_PATH)
    print("=" * 60)
    print("PIMA INDIANS DIABETES DATASET - EXPLORATORY SUMMARY")
    print("=" * 60)
    print(f"Total Cohort Records: {len(df)}")
    print(f"Total Clinical Features: {len(df.columns) - 1}")
    print(f"Class Distribution: Diabetic={df['Outcome'].sum()} ({(df['Outcome'].mean()*100):.1f}%), Healthy={len(df)-df['Outcome'].sum()} ({(100-df['Outcome'].mean()*100):.1f}%)")
    print("\nFeature Summary Statistics:")
    print(df.describe().round(2))

    print("\nPearson Correlation with Outcome (Target):")
    corr = df.corr()["Outcome"].sort_values(ascending=False)
    for col, val in corr.items():
        if col != "Outcome":
            print(f"  {col:<26}: {val:+.4f}")

    print("\nBiologically Impossible Zeros (Missing Lab Data):")
    cols_zero = ["Glucose", "BloodPressure", "SkinThickness", "Insulin", "BMI"]
    for c in cols_zero:
        zero_cnt = (df[c] == 0).sum()
        zero_pct = (zero_cnt / len(df)) * 100
        print(f"  {c:<20}: {zero_cnt} records ({zero_pct:.1f}% missing)")

    print("\nEDA Completed Successfully.")

if __name__ == "__main__":
    run_eda()
