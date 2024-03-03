import json
from flask import Flask, render_template
import pandas as pd
import numpy as np
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler
from flask import jsonify

app = Flask(__name__)


@app.route("/")
def index():
    return render_template("index.html")

@app.route("/pca_data")
def pca_data():
    df = pd.read_csv('data/data_filtered.csv')
    # features = ['Overall', 'Balance', 'Stamina', 'Strength', 'HeadingAccuracy',
    #             'ShortPassing', 'LongPassing', 'Dribbling', 'BallControl', 'Acceleration',
    #             'SprintSpeed', 'Agility', 'ShotPower', 'Aggression', 'Jumping', 'Vision',
    #             'Composure', 'StandingTackle', 'SlidingTackle']
    df = df.dropna()
    
    scaler = StandardScaler()
    data_standardized = scaler.fit_transform(df)
    
    n_components = min(data_standardized.shape)
    
    pca_results, pca_results_top3_attributes, pca_top2_components = calculate_pca(data_standardized, n_components)
    
    data_frontend = dict()
    data_frontend["pca_variance_ratios"] = json.dumps(pca_results.tolist())
    data_frontend["pca_variance_ratios_cumsum"] = json.dumps(np.cumsum(pca_results).tolist())
    data_frontend["pca_results_top_3_attributes_names"] = json.dumps(pca_results_top3_attributes.tolist())
    
    data_frontend["pca_scree_plot_data"] = [{"factor": i + 1, "eigenvalue": pca_results[i],"cumulative_eigenvalue": np.cumsum(pca_results)[i]} for i in range(19)]

    data_frontend = {'chart_data': data_frontend}
    
    return data_frontend

def calculate_pca(data, n_components):
    pca = PCA(n_components=n_components)
    pca.fit_transform(data)
    pca_results = pca.explained_variance_ratio_
    loadings = np.sum(np.square(pca.components_), axis=0)
    indices_of_top3_attributes = loadings.argsort()[-3:][::-1]
    top2_components = pca.components_[:2]
    return pca_results, indices_of_top3_attributes, top2_components


if __name__ == '__main__':
    app.run(debug=True)