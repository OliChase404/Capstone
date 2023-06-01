import networkx as nx
import matplotlib.pyplot as plt
from sklearn.cluster import SpectralClustering

from config import db, app
from models import Book, Genre, Author, Narrator, BookGenre, BookConnection, UserFilteredBook

if __name__ == '__main__':

    with app.app_context():

        all_book_connections = db.session.query(BookConnection).all()

        graph_data = []
        for book_connection in all_book_connections:
            data_point = (book_connection.book_id, book_connection.connected_book_id, 1)
            if data_point in graph_data:
                for index, data in enumerate(graph_data):
                    if data == data_point:
                        graph_data[index] = (book_connection.book_id, book_connection.connected_book_id, data[2] + 1)
            else: 
                graph_data.append(data_point)

        # print(graph_data)

        G = nx.DiGraph()
        for (u, v, w) in graph_data:
            G.add_edge(u, v, penwidth=w)

        # Perform clustering on the graph
        adjacency_matrix = nx.to_numpy_array(G)
        clustering = SpectralClustering(n_clusters=3, affinity='precomputed').fit_predict(adjacency_matrix)

        # Create a layout for the graph
        pos = nx.random_layout(G)

        # Draw nodes with different colors based on clustering
        node_colors = [int(cluster) for cluster in clustering]
        nx.draw_networkx_nodes(G, pos, node_color=node_colors, cmap=plt.cm.Set1)

        # Draw edges
        nx.draw_networkx_edges(G, pos)

        # Add labels (optional)
        nx.draw_networkx_labels(G, pos)

        # Display the graph
        plt.show()