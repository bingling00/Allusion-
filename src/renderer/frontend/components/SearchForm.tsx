import React, { useCallback, useContext } from 'react';
import { observer } from 'mobx-react-lite';

import MultiTagSelector from './MultiTagSelector';
import { FormGroup, Button, ButtonGroup, Dialog } from '@blueprintjs/core';
import StoreContext from '../contexts/StoreContext';
import { ClientTag } from '../../entities/Tag';
import IconSet from './Icons';
import { IIDsSearchCriteria } from '../../entities/SearchCriteria';
import { IFile } from '../../entities/File';

export const AdvancedSearchDialog = observer(() => {
  const { uiStore } = useContext(StoreContext);
  const themeClass = uiStore.theme === 'DARK' ? 'bp3-dark' : 'bp3-light';

  return (
    <Dialog
      isOpen={uiStore.isAdvancedSearchOpen}
      onClose={uiStore.toggleAdvancedSearch}
      icon={IconSet.SEARCH}
      title="Advanced Search"
      className={themeClass}
    >
      <SearchForm />
    </Dialog>
  );
});

const SearchForm = observer(() => {
  const { uiStore, tagStore } = useContext(StoreContext);

  const existingQueryFields = uiStore.searchCriteriaList.map((q, qIndex) => {
    // Todo: fix this later
    const includedTags = (q as IIDsSearchCriteria<IFile>).value;

    const handleIncludeTag = (tag: ClientTag) => includedTags.push(tag.id);
    const handleExcludeTag = (tag: ClientTag) => includedTags.splice(tagStore.tagList.indexOf(tag), 1);
    const handleClearIncludedTags = () => includedTags.splice(0, includedTags.length);

    return (
      <MultiTagSelector
        key={`query-field-${qIndex}`}
        selectedTags={includedTags.map((id) => tagStore.tagList.find((t) => t.id === id) as ClientTag)}
        onTagSelect={handleIncludeTag}
        onTagDeselect={handleExcludeTag}
        onClearSelection={handleClearIncludedTags}
        placeholder="Include"
        autoFocus
      />
    );
  });

  const addSearchQuery = useCallback(
    () => uiStore.addSearchQuery({ key: 'tags', action: 'include', operator: 'or', value: [] }),
    []);

  return (
    <div id="search-form">
      <FormGroup label="Query">
        {existingQueryFields}
      </FormGroup>

      {/*
        <FormGroup label="Tags" >
          // Todo: Also search through collections
          <MultiTagSelector
            selectedTags={[]}
            onTagSelect={() => console.log('select')}
            onTagDeselect={() => console.log('deselect')}
            onClearSelection={() => console.log('clear')}
            placeholder="Include (WIP)"
          />
          <MultiTagSelector
            selectedTags={[]}
            onTagSelect={() => console.log('select')}
            onTagDeselect={() => console.log('deselect')}
            onClearSelection={() => console.log('clear')}
            placeholder="Exclude (WIP)"
          />
        </FormGroup>

        <FormGroup label="Filename">
          <InputGroup placeholder="Include" disabled />
          <InputGroup placeholder="Exclude" disabled />
        </FormGroup>

        <FormGroup label="Location">
          <InputGroup placeholder="Include" disabled />
          <InputGroup placeholder="Exclude" disabled />
        </FormGroup>

        <FormGroup label="File type" labelFor="file-type-input">
          <InputGroup placeholder="Include" disabled />
          <InputGroup placeholder="Exclude" disabled />
        </FormGroup>
        */}

        <Button icon={IconSet.ADD} onClick={addSearchQuery} fill text="Query"/>
        <ButtonGroup vertical fill>
        <Button
          intent="primary"
          onClick={uiStore.viewContentQuery}
          disabled={uiStore.searchCriteriaList.length === 0}
          text="Search"
          icon={IconSet.SEARCH}
          fill
        />
        <Button
          // intent="warning"
          onClick={uiStore.clearSearchQueryList}
          disabled={uiStore.searchCriteriaList.length === 0}
          text="Reset"
          icon={IconSet.CLOSE}
          fill
        />
      </ButtonGroup>
    </div>
  );
});

export default SearchForm;
