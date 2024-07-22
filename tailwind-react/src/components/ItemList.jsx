import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSearch,
  faList,
  faTh,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';

const ItemList = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [allSearchTerms, setAllSearchTerms] = useState([]);
  const [page, setPage] = useState(1);
  const [view, setView] = useState('card');
  const [totalCount, setTotalCount] = useState(0);

  const fetchUsers = async (page = 1, searchTerms = []) => {
    try {
      const response = await fetch(`http://localhost:3000/user/${page}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ terms: searchTerms }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok ' + response.statusText);
      }

      const data = await response.json();
      if (page === 1) {
        setUsers(data.data);
      } else {
        setUsers((prevUsers) => [...prevUsers, ...data.data]);
      }
      setTotalCount(data.count);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  useEffect(() => {
    fetchUsers(page, allSearchTerms);
  }, [page, allSearchTerms]);

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      const newSearchTerms = [...allSearchTerms, searchTerm.trim()];
      setAllSearchTerms(newSearchTerms);
      setSearchTerm('');
      setPage(1);
      fetchUsers(1, newSearchTerms);
    }
  };

  const handleRemoveTerm = (term) => {
    const newTerms = allSearchTerms.filter((t) => t !== term);
    setAllSearchTerms(newTerms);
    setPage(1);
    fetchUsers(1, newTerms);
  };

  const handleShowMore = () => {
    setPage((prevPage) => prevPage + 1);
  };

  const filteredUsers = users.filter((user) =>
    allSearchTerms.every(
      (term) =>
        `${user.firstName} ${user.lastName}`
          .toLowerCase()
          .includes(term.toLowerCase()) ||
        user.jobTitle.toLowerCase().includes(term.toLowerCase()) ||
        user.email.toLowerCase().includes(term.toLowerCase())
    )
  );

  return (
    <div className="p-4 min-h-screen container mx-auto">
      <div className="mb-4">
        <div className="flex items-center">
          <div className="relative flex w-full">
            <input
              type="text"
              placeholder="Rechercher un utilisateur..."
              className="border border-gray-300 p-2 w-full rounded-l"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleSearch}
            />
            <button className="bg-blue-500 text-white px-4">
              <FontAwesomeIcon icon={faSearch} />
            </button>
          </div>
          <div className="flex ml-2">
            <button
              onClick={() => setView('list')}
              className={`${
                view === 'list' ? 'bg-gray-700' : 'bg-gray-300'
              } text-white border border-gray-300 px-4 rounded-l icon-button`}>
              <FontAwesomeIcon icon={faList} />
            </button>
            <button
              onClick={() => setView('card')}
              className={`${
                view === 'card' ? 'bg-gray-700' : 'bg-gray-300'
              } text-white border border-gray-300 px-4 rounded-r icon-button`}>
              <FontAwesomeIcon icon={faTh} />
            </button>
          </div>
        </div>
        <div className="flex flex-wrap mt-2 space-x-2">
          {allSearchTerms.map((term, index) => (
            <div
              key={index}
              className="bg-blue-500 text-white py-1 px-3 rounded-full flex items-center space-x-1 mr-2 mb-2">
              <span>{term}</span>
              <button
                onClick={() => handleRemoveTerm(term)}
                className="text-white hover:text-gray-300 focus:outline-none">
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
          ))}
        </div>
      </div>
      {view === 'card' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              className="w-full bg-gray-800 rounded overflow-hidden shadow-lg transform transition-transform duration-300 hover:scale-105">
              <img
                className="w-full h-64 object-cover"
                src={user.imageUrl}
                alt={`${user.firstName} ${user.lastName}`}
              />
              <div className="px-6 py-4">
                <div className="font-bold text-xl mb-2 text-gray-100">{`${user.firstName} ${user.lastName}`}</div>
                <p className="text-gray-300 text-base">{user.jobTitle}</p>
                <p className="text-gray-300 text-base">{user.email}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full bg-gray-800 text-white table-fixed">
            <thead>
              <tr>
                <th className="py-4 px-6 w-1/4">Image</th>
                <th className="py-4 px-6 w-1/4">Nom</th>
                <th className="py-4 px-6 w-1/4">Métier</th>
                <th className="py-4 px-6 w-1/4">Email</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user, index) => (
                <tr
                  key={user.id}
                  className={`${
                    index % 2 === 0 ? 'bg-gray-700' : 'bg-gray-600'
                  } h-24 transform transition-transform duration-300 hover:scale-105`}>
                  <td className="py-6 px-6">
                    <img
                      src={user.imageUrl}
                      alt={`${user.firstName} ${user.lastName}`}
                      className="w-16 h-16"
                    />
                  </td>
                  <td className="py-6 px-6">{`${user.firstName} ${user.lastName}`}</td>
                  <td className="py-6 px-6">{user.jobTitle}</td>
                  <td className="py-6 px-6">{user.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="flex justify-between mt-4">
        <button
          onClick={handleShowMore}
          className="px-4 py-2 bg-gray-300 rounded">
          Afficher plus
        </button>
        <div className="text-gray-300">
          {`Éléments affichés : ${filteredUsers.length}`}
        </div>
      </div>
    </div>
  );
};

export default ItemList;
