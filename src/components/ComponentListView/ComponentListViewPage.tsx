import * as React from 'react';
import { Link } from 'react-router-dom';
import {
  DataList,
  DataListCell,
  DataListItem,
  DataListItemCells,
  DataListItemRow,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  TextInput,
  Button,
} from '@patternfly/react-core';
import { FilterIcon } from '@patternfly/react-icons/dist/js/icons';
import { useK8sWatchResource } from '../../dynamic-plugin-sdk';
import { useActiveNamespace } from '../../hooks/useActiveNamespace';
import { ComponentGroupVersionKind } from '../../models';
import { StatusBox } from '../../shared/components/status-box/StatusBox';
import { ComponentKind } from '../../types';
import { ComponentListItem } from './ComponentListItem';

type ComponentListViewPageProps = {
  application: string;
};

export const ComponentListViewPage: React.FC<ComponentListViewPageProps> = ({ application }) => {
  const namespace = useActiveNamespace();
  const [allComponents, componentsLoaded] = useK8sWatchResource<ComponentKind[]>({
    groupVersionKind: ComponentGroupVersionKind,
    namespace,
    isList: true,
  });
  const loaded = namespace && componentsLoaded;

  // TODO: handle empty state / components not found
  const components = React.useMemo(
    () => (loaded ? allComponents?.filter((c) => c.spec.application === application) : []),
    [allComponents, application, loaded],
  );

  const [nameFilter, setNameFilter] = React.useState<string>('');

  const filteredComponents = React.useMemo(
    () =>
      nameFilter
        ? components.filter((component) => component.metadata.name.indexOf(nameFilter) !== -1)
        : components,
    [nameFilter, components],
  );

  const onClearFilters = () => setNameFilter('');
  const onNameInput = (name: string) => setNameFilter(name);

  return (
    <StatusBox data={allComponents} loaded={loaded}>
      <Toolbar data-testid="component-list-filter-toolbar" clearAllFilters={onClearFilters}>
        <ToolbarContent>
          <ToolbarItem>
            <Button variant="control">
              <FilterIcon /> {'Name'}
            </Button>
          </ToolbarItem>
          <ToolbarItem>
            <TextInput
              name="nameInput"
              data-testid="nameInput1"
              type="search"
              aria-label="name filter"
              placeholder="Filter by name..."
              onChange={(name) => onNameInput(name)}
            />
          </ToolbarItem>
        </ToolbarContent>
      </Toolbar>

      <DataList aria-label="Components" data-testid="component-list">
        <DataListItem>
          <DataListItemRow>
            <DataListItemCells
              dataListCells={[
                <DataListCell key="add component">
                  <Link
                    className="pf-c-button pf-m-primary"
                    to={`/create?application=${application}`}
                  >
                    Add Component
                  </Link>
                </DataListCell>,
              ]}
            />
          </DataListItemRow>
        </DataListItem>
        {filteredComponents?.map((component) => (
          <ComponentListItem key={component.metadata.uid} component={component} />
        ))}
      </DataList>
    </StatusBox>
  );
};
