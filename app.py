
from flask import Flask, render_template, request, session
import pandas as pd
import numpy as np
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from flask import jsonify

app = Flask(__name__)
app.secret_key = "e8be294b0b0f4e40a3f30f855a76b205"

df = pd.read_csv('data/data_1000.csv')
# features = ['Overall', 'Balance', 'Stamina', 'Strength', 'HeadingAccuracy',
#             'ShortPassing', 'LongPassing', 'Dribbling', 'BallControl', 'Acceleration',
#             'SprintSpeed', 'Agility', 'ShotPower', 'Aggression', 'Jumping', 'Vision',
#             'Composure', 'StandingTackle', 'SlidingTackle']
df = df.dropna()
# df = df.head(1000)
# df.to_csv("data_1000.csv", index = False)

scaler = StandardScaler()
data_standardized = scaler.fit_transform(df)


@app.route("/")
def index():
    return render_template("index.html")

@app.route("/pca_data")
def pca_data():
    pca = PCA()
    pca.fit_transform(data_standardized)
    
    explained_variance_ratios = pca.explained_variance_ratio_
    
    chart_data = {
        "explained_variance_ratios": explained_variance_ratios.tolist(),
        "explained_variance_ratios_cumsum": np.cumsum(explained_variance_ratios).tolist(),
        "pca_scree_plot_data" : [{"factor": i + 1, "eigenvalue": explained_variance_ratios[i],"cumulative_eigenvalue": np.cumsum(explained_variance_ratios)[i]} for i in range(19)]
    }
    
    return jsonify(chart_data)


@app.route('/receive_data', methods=['POST'])
def receive_idi():
    print("Getting latest IDI value")
    data = request.get_json()
    session['idi'] = data['idi']
    session['k'] = data['k']
    return jsonify({'message': 'IDI received successfully',
                    "idi" : session["idi"],
                    "k" : session['k']})
    

@app.route('/elbow_plot_data')
def elbow_plot_data():
    
    idi = session.get('idi', 0)
    k = session.get('k', 0)
    print("IDI : ", idi)
    
    if idi == 0:
        return jsonify({'error': 'Dimensionality index not set'})
    if k == 0:
        return jsonify({'error': 'K value not set'})
    
    pca = PCA(n_components=idi)
    pcs = pca.fit_transform(data_standardized)
    
    column_names = [f'PC{i+1}' for i in range(pcs.shape[1])]
    pca_df = pd.DataFrame(data=pcs, columns=column_names)
    # pca_df_standardized = scaler.fit_transform(pca_df)
    
    distortions = []
    
    K = range(1,11)
    for i in K:
        kmeans = KMeans(n_clusters=i, random_state=0)
        kmeans.fit(pca_df)
        distortions.append(kmeans.inertia_)

        
    chart_data = {
        "K" : list(K),
        "distortions" : distortions
    }    
    return jsonify(chart_data)



@app.route('/pca_idi_data')
def pca_idi_data():
    idi = session.get('idi', 0)
    k = session.get('k', 0)
    print("IDI : ", idi)
    
    if idi == 0:
        return jsonify({'error': 'Dimensionality index not set'})
    if k == 0:
        return jsonify({'error': 'K value not set'})
    
    pca = PCA(n_components=idi)
    pcs = pca.fit_transform(data_standardized)
    
    loadings = pca.components_
    squared_sum_loadings = np.sum(np.square(pca.components_), axis=0)
    top4_indices = np.argsort(squared_sum_loadings)[::-1][:4]

    top4_attributes = [df.columns[i] for i in top4_indices]
    top4_values = [round(squared_sum_loadings[i], 2) for i in top4_indices]

    top_features = df.columns[top4_indices][:2]
    
    scatterplot_data = df[top4_attributes].to_dict(orient='records')
    # print("top4_attributes ", top4_attributes)
    
    
    #perform kmeans on selected k
    
    column_names = [f'PC{i+1}' for i in range(pcs.shape[1])]
    pca_df = pd.DataFrame(data=pcs, columns=column_names)
    kmeans = KMeans(n_clusters=k, random_state=0)
    kmeans.fit(pca_df)
    cluster_labels = kmeans.labels_
    pca_df['cluster_id'] = cluster_labels
    
    # print(len(pca_df['cluster_id']))
    # print(pca_df['cluster_id'])
    
    chart_data = {"top4_attributes": top4_attributes,
                    "scatterplot_data" : scatterplot_data,
                    "cluster_id" : pca_df['cluster_id'].to_list(),
                    "sum_sq_loadings" : top4_values,
                    "pca_loadings": loadings[:2].tolist(),
                    "pca_scores": pcs[:, :2].tolist(),
                    "features": top_features.tolist()
                    }
    
    return jsonify(chart_data)
    


if __name__ == '__main__':
    app.run(debug=True)