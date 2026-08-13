'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { DataSource } from '../lib/animeApi';

interface DataSourceContextType {
  dataSource: DataSource;
  setDataSource: (source: DataSource) => void;
  dataSourceName: string;
  dataSourceDescription: string;
}

const DataSourceContext = createContext<DataSourceContextType | undefined>(undefined);

const DATA_SOURCE_STORAGE_KEY = 'animestream_datasource_preference';

export const DataSourceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dataSource, setDataSourceState] = useState<DataSource>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(DATA_SOURCE_STORAGE_KEY) as DataSource;
      if (saved && ['auto', 'jikan', 'anilist'].includes(saved)) {
        return saved;
      }
    }
    return 'auto';
  });

  const setDataSource = (source: DataSource) => {
    setDataSourceState(source);
    if (typeof window !== 'undefined') {
      localStorage.setItem(DATA_SOURCE_STORAGE_KEY, source);
    }
  };

  const getSourceInfo = () => {
    switch (dataSource) {
      case 'anilist':
        return {
          name: 'AniList GraphQL',
          description: 'Powered by AniList GraphQL v2 API (Fast queries, high-res banners & countdowns)',
        };
      case 'jikan':
        return {
          name: 'MyAnimeList (Jikan)',
          description: 'Powered by Jikan v4 API (Official MAL database, voice actors & detailed themes)',
        };
      case 'auto':
      default:
        return {
          name: 'Auto (Hybrid)',
          description: 'Intelligent multi-source balancer between AniList GraphQL and Jikan MAL',
        };
    }
  };

  const { name, description } = getSourceInfo();

  return (
    <DataSourceContext.Provider
      value={{
        dataSource,
        setDataSource,
        dataSourceName: name,
        dataSourceDescription: description,
      }}
    >
      {children}
    </DataSourceContext.Provider>
  );
};

export const useDataSource = (): DataSourceContextType => {
  const context = useContext(DataSourceContext);
  if (!context) {
    throw new Error('useDataSource must be used within a DataSourceProvider');
  }
  return context;
};
