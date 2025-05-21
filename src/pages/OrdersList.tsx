
  const renderEmptyState = () => {
    switch(activeTab) {
      case 'new':
        return (
          <EmptyState 
            icon={FileBarChart}
            title="No new orders today"
            description="No new orders have been created today."
            actionLabel="Create Order"
            actionHref="/orders/new"
          />
        );
      case 'pending':
        return (
          <EmptyState 
            icon={PackageSearch}
            title="No pending pickups"
            description="No orders are pending pickup at the moment."
            actionLabel="Schedule Pickup"
            actionHref="/pickups"
          />
        );
      case 'awaitingAction':
        return (
          <EmptyState 
            icon={CheckCheck}
            title="No orders awaiting action"
            description="There are no orders that require your attention right now."
            actionLabel="Create Order"
            actionHref="/orders/new"
          />
        );
      default:
        return (
          <EmptyState 
            icon={FileBarChart}
            title="No orders found"
            description="There are no orders matching your current filters."
            actionLabel="Create Order"
            actionHref="/orders/new"
          />
        );
    }
  };
