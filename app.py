
from flask import Flask, render_template, request
import pandas as pd
import numpy as np
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from flask import jsonify


from sklearn import manifold
from sklearn.metrics import pairwise_distances


values = {}

app = Flask(__name__)

data = pd.read_csv('data/data_1000_final.csv')
features = ['Name', 'Overall', 'Balance', 'Stamina', 'Strength', 'HeadingAccuracy',
             'BallControl', 'Acceleration',
            'SprintSpeed', 'Agility', 'Aggression', 'Jumping', 'Vision',
            'Composure', 'StandingTackle', 'SlidingTackle']
data = data[features]
data = data.dropna()
# data = data.head(1000)
# data.to_csv("data_1000_final.csv", index = False)

df = data.drop(columns=['Name'])

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
        "pca_scree_plot_data" : [{"factor": i + 1, "eigenvalue": explained_variance_ratios[i],"cumulative_eigenvalue": np.cumsum(explained_variance_ratios)[i]} for i in range(15)]
    }
    
    return jsonify(chart_data)


@app.route('/receive_data', methods=['POST'])
def receive_idi():
    print("Getting latest IDI value")
    data = request.get_json()
    values['idi'] = data['idi']
    values['k'] = data['k']
    return jsonify({'message': 'IDI received successfully',
                    "idi" : values["idi"],
                    "k" : values['k']})


@app.route('/elbow_plot_data')
def elbow_plot_data():
    
    idi = values.get('idi', 0)
    k = values.get('k', 0)
    
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



# @app.route('/pca_idi_data')
# def pca_idi_data():
    
#     idi = values.get('idi', 0)
#     k = values.get('k', 0)

#     if idi == 0:
#         return jsonify({'error': 'Dimensionality index not set'})
#     if k == 0:
#         return jsonify({'error': 'K value not set'})
    
#     pca = PCA(n_components=idi)
#     pcs = pca.fit_transform(data_standardized)
    
#     loadings = pca.components_
#     explained_variance_ratio = pca.explained_variance_ratio_
#     squared_sum_loadings = np.sum(loadings ** 2, axis=0)
#     top4_indices = np.argsort(squared_sum_loadings)[::-1][:4]

#     top4_attributes = [df.columns[i] for i in top4_indices]
#     top4_values = [round(squared_sum_loadings[i], 2) for i in top4_indices]
#     top_features = df.columns[top4_indices].to_list()

#     scatterplot_data = df[top4_attributes].to_dict(orient='records')
    
    
#     #perform kmeans on selected k
#     column_names = [f'PC{i+1}' for i in range(pcs.shape[1])]
#     pca_df = pd.DataFrame(data=pcs, columns=column_names)
#     kmeans = KMeans(n_clusters=k, random_state=0)
#     kmeans.fit(pca_df)
#     cluster_labels = kmeans.labels_
#     pca_df['cluster_id'] = cluster_labels
    
    
#     biplot_data = {
#                 "sum_sq_loadings" : top4_values,
#                 "pca_loadings": loadings[:2, :].tolist(),
#                 "pca_scores": pcs[:, :2].tolist(),
#                 "features": top_features,
#                 "feature_names" : df.columns.to_list(),
#                 "cluster_id" : pca_df['cluster_id'].to_list(),
#                 "explained_variance_ratio": explained_variance_ratio[:2].tolist(),
#                 "observation_names" : data['Name'].to_list()              
#     }
    
#     scatter_plot_data = {
#                 "top4_attributes": top4_attributes,
#                 "scatterplot_data" : scatterplot_data,
#                 "cluster_id" : pca_df['cluster_id'].to_list()
#     }
    
#     chart_data = {
#                 "biplot_data" : biplot_data,
#                 "scatter_plot_data" : scatter_plot_data,
#                 "sos_loadings" : top4_values
#                     }
    
#     return jsonify(chart_data)
    


@app.route('/mds_data')
def mds_data():
    data_columns = []

    euclidean_distances = pairwise_distances(df, metric='euclidean')
    mds_data = manifold.MDS(n_components=2, dissimilarity='precomputed')
    X = mds_data.fit_transform(euclidean_distances)

    data_columns = pd.DataFrame(X, columns=['Comp1', 'Comp2'])
    
    k = values.get('k', 0)
    if k == 0:
        return jsonify({'error': 'K value not set'})
    
    kmeans = KMeans(n_clusters=k, random_state=0)
    kmeans.fit(data_standardized)
    cluster_labels = kmeans.labels_
    
    data_columns["cluster_id"] = cluster_labels
    json_data = data_columns.to_dict(orient='records')
    
    chart_data = {
        'mds_data' : json_data,
        'cluster_id' : data_columns['cluster_id'].to_list()
    }
    
    return jsonify(chart_data)

@app.route('/mds_attr')
def mds_attr():
    data_columns = []
    
    dissimilarities = 1 - np.abs(df.corr())
    mds = manifold.MDS(n_components=2, dissimilarity='precomputed')
    X = mds.fit_transform(dissimilarities)

    # Create DataFrame with MDS results
    data_columns = pd.DataFrame(X, columns=['Comp1', 'Comp2'])
    data_columns['feature'] = df.columns
    
    # Convert DataFrame to JSON
    json_data = data_columns.to_dict(orient='records')
    
    chart_data = {
        'mds_attr': json_data
    }
    return jsonify(chart_data)


@app.route('/pcp_data')
def pcp_data():
    # Prepare the data for PCP
    k = values.get('k', 0)
    if k == 0:
        return jsonify({'error': 'K value not set'})
    
    kmeans = KMeans(n_clusters=k, random_state=0)
    kmeans.fit(data_standardized)
    cluster_labels = kmeans.labels_
    
    data = df.head(100).to_dict(orient='records')
    chart_data = {
        'pcp_data' : data,
        'features' : df.columns.to_list(),
        'cluster_id' : cluster_labels.tolist()[:100]
    }
    return jsonify(chart_data)

if __name__ == '__main__':
    app.run(debug=True)
    
