
from flask import Flask, render_template, request
import pandas as pd
import numpy as np
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from flask import jsonify


from sklearn import manifold
from sklearn.metrics import pairwise_distances
from sklearn.preprocessing import LabelEncoder


values = {}

app = Flask(__name__)

data = pd.read_csv('data/data_final.csv')

# all_features = ['Age', 'Value','Wage','International Reputation', 'Position2','Acceleration',
#             'Overall', 'Balance','Stamina','Strength','HeadingAccuracy','Aggression',
#             'StandingTackle', 'SlidingTackle', 'Club', 'Body Type', 'Preferred Foot' ]

# data = data[features]
data = data.dropna()

categorical = ['Reputation', 'Position2', 'Club', 'Body Type', 'Preferred Foot']
numerical = ['Age', 'Value','Wage','Acceleration', 'Overall', 'Balance','Stamina'
             ,'HeadingAccuracy', 'StandingTackle', 'SlidingTackle' ]

df_numerical = data[numerical]
df_all = data

scaler = StandardScaler()
data_standardized = scaler.fit_transform(df_numerical)

new_df = df_all.copy()

encodingMapping = {}
for col in categorical:
    le = LabelEncoder()
    new_df[col] = le.fit_transform(new_df[col])
    encodingMapping[col] = dict(zip(le.transform(le.classes_), le.classes_))


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
        "pca_scree_plot_data" : [{"factor": i + 1, "eigenvalue": explained_variance_ratios[i],"cumulative_eigenvalue": np.cumsum(explained_variance_ratios)[i]} for i in range(10)]
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
    


@app.route('/mds_data')
def mds_data():
    data_columns = []

    euclidean_distances = pairwise_distances(df_numerical, metric='euclidean')
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
    
    dissimilarities = 1 - np.abs(df_numerical.corr())
    mds = manifold.MDS(n_components=2, dissimilarity='precomputed')
    X = mds.fit_transform(dissimilarities)

    # Create DataFrame with MDS results
    data_columns = pd.DataFrame(X, columns=['Comp1', 'Comp2'])
    data_columns['feature'] = df_numerical.columns
    
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
    
    data = df_all.to_dict(orient='records')

    chart_data = {
        'pcp_data' : data,
        'features' : df_all.columns.to_list(),
        'cluster_id' : cluster_labels.tolist()
        
    }
    return jsonify(chart_data)

if __name__ == '__main__':
    app.run(debug=True)
    
