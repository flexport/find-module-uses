# Overview

`find-module-uses` is a utility to help you figure out what modules might be
affected by your js changes, and where to find them. Especially useful for UI
changes, where you want to be certain that you haven't screwed up the rendering
 of any of the enclosing components.

`show-module-dependents` is a more generic utility allowing you to explore the
dependents of a specific module and visualize/restrict said dependents in
 useful ways.

# Installation

```
npm install -g find-module-uses
```

Run this from the comand line to install both utilities.

# find-uses

## Use


```
find-module-uses $ModuleName
```

### Flags

```
  -w, --webpackPath        [string] [default: "node_modules/.bin/webpack"]
  -p, --profilePath        [string] [default: "tmp/profile.json"]
  -f, --forceRegenProfile  [boolean] [default: "false"]
  -r, --root               [string]
  -d, --depth              [number] [default: "1"]
  --help                   [boolean]
```

`-p`/`--profilePath` and `-f`/`--forceRegenProfile`
By default, it looks for the webpack profile at tmp/profile.json. You can specify a different path with the -p/--profile flag. If it's not there, it will generate it for you. You can also force it to regenerate the profile by passing -f/--forceRegenProfile.

`-w`/`--webpackPath`
The tool uses the webpack CLI command to generate the profile. By default, it assumes that tool's available at `node_modules/.bin/webpack`, but that can be overriden with this command.

`-d`/`--depth`
As mentioned, this flag is a little confusing, I confess, and is very different from `-d` in `list-deps`. It determines the depth of what constitutes "direct use". By default, it's 1, which tells the script to only look one level up, and finds an example path for each of those users of your module. But, if it were instead say 3, the script will find all uses 3 levels up, and *then*, for each of those paths, find an example path originating at the "root".

`-r`/`--root`
The "root" to of the graph to restrict the sarch to. If passed, the script will only return results that are within this subgraph.

## Examples

### Basic
 ```
find-module-uses TimePicker
```

<details>

```
Directly used by:
  ./components/form/DateAndTimeField.jsx
Example path:
  ./dispatch/DispatchApp.jsx
  ./dispatch/components/delivery_orders/RequestsList.jsx
  ./dispatch/components/deliveries/Delivery.jsx
  ./dispatch/components/deliveries/DeliveryHeader.jsx
  ./dispatch/components/deliveries/actionItems/DeliveryActionItems.jsx
  ./dispatch/components/deliveries/DeliveryDateModal.jsx
  ./components/form/DateAndTimeField.jsx
  ./components/form/TimePicker.jsx

Directly used by:
  ./components/form/TimeField.jsx
Example path:
  ./core/CoreApp.jsx
  ./core/components/shipments/show/ShipmentDetailsInterface.jsx
  ./core/components/shipments/ShipmentDetailsLoader.jsx
  ./core/components/shipments/show/ShipmentDetailsContainer.jsx
  ./core/components/shipments/show/ShipmentView.jsx
  ./core/components/shipments/show/ShipmentActionItems.jsx
  ./core/components/shipments/action_items/DeliveryAppointmentScheduleActionItem.jsx
  ./components/form/TimeRangeField.jsx
  ./components/form/TimeField.jsx
  ./components/form/TimePicker.jsx

2 USES FOUND FOR: ./components/form/TimePicker.jsx
```

</details>

# show-module-dependents

## Use

```
find-module-uses $ModuleName
```

### Flags
```
  -p, --profilePath        [string] [default: "tmp/profile.json"]
  -f, --forceRegenProfile  [boolean] [default: "false"]
  -w, --webpackPath        [string] [default: "node_modules/.bin/webpack"]
  -e, --exclude            [string] [default: []]
  -m, --mode               ['tree' | 'flat' | 'graphviz] [default: 'tree]
  -d, --depth              [number] [default: "5"]
  --help                   [boolean]

```

`-p`/`--profilePath` and `-f`/`--forceRegenProfile`
By default, it looks for the webpack profile at tmp/profile.json. You can specify a different path with the -p/--profile flag. If it's not there, it will generate it for you. You can also force it to regenerate the profile by passing -f/--forceRegenProfile.

`-w`/`--webpackPath`
The tool uses the webpack CLI command to generate the profile. By default, it assumes that tool's available at `node_modules/.bin/webpack`, but that can be overriden with this command.

`-e`/`--exclude`
You can exclude a dependent from the subsequent hierarchy by passing its name with the -e flag. I've found this helpful when you know you've correctly handled a change in one dependant, and want to see what else might be affected. Note that you can pass multiple files by passing the flag mulitple times (ie, show-module-dependents $module -e $excluded_module_1 -e $excluded_module_2).

`-d`/`--depth`
To keep things from being too overwhelming, the command only lists 5 levels of the hierarchy. You can override it to be higher/lower with -d/--depth. 5 by default.

`-r`/`--root`
The "root" to of the graph to restrict the sarch to. If passed, the script will only return results that are within this subgraph.

 `-m`/`--mode`
Visualization mode. There are three available:
 * flat: lists each layer of dependents as a flat list.
 * tree: prints out a formatted tree.
 * graphviz: prints the tree in the graphviz format (use http://www.webgraphviz.com/ or `dot` to render)


## Examples

### Basic
 ```
show-module-dependents TimePicker
```

<details>

```
./components/form/TimePicker.jsx
    ./components/form/DateAndTimeField.jsx
        ./dispatch/components/deliveries/DeliveryDateModal.jsx
            ./dispatch/components/deliveries/actionItems/DeliveryActionItems.jsx
                ./dispatch/components/deliveries/DeliveryHeader.jsx
                    ./dispatch/components/deliveries/Delivery.jsx (Excluded, 6 child modules hidden)
    ./components/form/TimeField.jsx
        ./components/form/TimeRangeField.jsx
            ./dispatch/components/deliveries/DeliveryDateModal.jsx
                ./dispatch/components/deliveries/actionItems/DeliveryActionItems.jsx
                    ./dispatch/components/deliveries/DeliveryHeader.jsx (Excluded, 7 child modules hidden)
            ./core/components/shipments/action_items/DeliveryAppointmentScheduleActionItem.jsx
                ./core/components/shipments/show/ShipmentActionItems.jsx
                    ./core/components/shipments/show/ShipmentView.jsx (Excluded, 17 child modules hidden)
    ./components/form/TimePickerContainer.jsx
```

</details>

### Excluding a module

```
show-module-dependents TimePicker -e DeliveryDateModal
```

<details>

```
./components/form/TimePicker.jsx
    ./components/form/DateAndTimeField.jsx
        ./dispatch/components/deliveries/DeliveryDateModal.jsx (Excluded, 9 child modules hidden)
    ./components/form/TimeField.jsx
        ./components/form/TimeRangeField.jsx
            ./dispatch/components/deliveries/DeliveryDateModal.jsx (Excluded, 9 child modules hidden)
            ./core/components/shipments/action_items/DeliveryAppointmentScheduleActionItem.jsx
                ./core/components/shipments/show/ShipmentActionItems.jsx
                    ./core/components/shipments/show/ShipmentView.jsx (Excluded, 17 child modules hidden)
    ./components/form/TimePickerContainer.jsx
```
</details>

### Excluding multiple modules

```
show-module-dependents TimePicker -e DeliveryDateModal -e DeliveryAppointmentScheduleActionItem
```

<details>

```
./components/form/TimePicker.jsx
    ./components/form/DateAndTimeField.jsx
        ./dispatch/components/deliveries/DeliveryDateModal.jsx (Excluded, 9 child modules hidden)
    ./components/form/TimeField.jsx
        ./components/form/TimeRangeField.jsx
            ./dispatch/components/deliveries/DeliveryDateModal.jsx (Excluded, 9 child modules hidden)
            ./core/components/shipments/action_items/DeliveryAppointmentScheduleActionItem.jsx (Excluded, 19 child modules hidden)
    ./components/form/TimePickerContainer.jsx
```
</details>

### Show more depth
```
show-module-dependents TimePicker -d 10
```

<details>

```
./components/form/TimePicker.jsx
    ./components/form/DateAndTimeField.jsx
        ./dispatch/components/deliveries/DeliveryDateModal.jsx
            ./dispatch/components/deliveries/actionItems/DeliveryActionItems.jsx
                ./dispatch/components/deliveries/DeliveryHeader.jsx
                    ./dispatch/components/deliveries/Delivery.jsx
                        ./dispatch/components/delivery_orders/RequestsList.jsx
                            ./dispatch/DispatchApp.jsx
                                ./dispatch/DispatchLoader.jsx
                        ./dispatch/components/carriers/LoadsList.jsx
                            ./dispatch/DispatchApp.jsx
                                ./dispatch/DispatchLoader.jsx
    ./components/form/TimeField.jsx
        ./components/form/TimeRangeField.jsx
            ./dispatch/components/deliveries/DeliveryDateModal.jsx
                ./dispatch/components/deliveries/actionItems/DeliveryActionItems.jsx
                    ./dispatch/components/deliveries/DeliveryHeader.jsx
                        ./dispatch/components/deliveries/Delivery.jsx
                            ./dispatch/components/delivery_orders/RequestsList.jsx
                                ./dispatch/DispatchApp.jsx
                                    ./dispatch/DispatchLoader.jsx
                            ./dispatch/components/carriers/LoadsList.jsx
                                ./dispatch/DispatchApp.jsx
                                    ./dispatch/DispatchLoader.jsx
            ./core/components/shipments/action_items/DeliveryAppointmentScheduleActionItem.jsx
                ./core/components/shipments/show/ShipmentActionItems.jsx
                    ./core/components/shipments/show/ShipmentView.jsx
                        ./core/components/shipments/show/ShipmentDetailsContainer.jsx
                            ./core/components/shipments/ShipmentDetailsLoader.jsx
                                ./core/components/shipments/show/ShipmentDetailsInterface.jsx
                                    ./core/CoreApp.jsx
                                        ./core/CoreLoader.jsx (Excluded, 0 child modules hidden)
                                ./core/components/shipments/index/ShipmentQuickView.jsx
                                    ./core/components/shipments/index/ShipmentListInterface.jsx
                                        ./core/CoreApp.jsx (Excluded, 1 child modules hidden)
                                ./core/components/inbox/InboxShipment.jsx
                                    ./core/components/inbox/InboxInterface.jsx
                                        ./core/CoreApp.jsx (Excluded, 1 child modules hidden)
                                    ./core/components/inbox/InboxNote.jsx
                                        ./core/components/inbox/InboxInterface.jsx (Excluded, 2 child modules hidden)
    ./components/form/TimePickerContainer.jsx
```

</details>

### Other Visualizations
```
show-module-dependents TimePicker -m flat
```

<details>

```
ROOT MODULE:
./components/form/TimePicker.jsx


Level 1
./components/form/DateAndTimeField.jsx
./components/form/TimeField.jsx
./components/form/TimePickerContainer.jsx


Level 2
./dispatch/components/deliveries/DeliveryDateModal.jsx
./components/form/TimeRangeField.jsx


Level 3
./dispatch/components/deliveries/actionItems/DeliveryActionItems.jsx
./core/components/shipments/action_items/DeliveryAppointmentScheduleActionItem.jsx


Level 4
./dispatch/components/deliveries/DeliveryHeader.jsx
./core/components/shipments/show/ShipmentActionItems.jsx


Level 5
./dispatch/components/deliveries/Delivery.jsx
./core/components/shipments/show/ShipmentView.jsx
```
</details>

```
show-module-dependents TimePicker -m graphviz
```

<details>

Note that you probably want to pipe this into http://www.webgraphviz.com/ or `dot`

```
strict digraph {
  "components/form\nTimePicker.jsx" -> "components/form\nDateAndTimeField.jsx";
  "components/form\nTimePicker.jsx" -> "components/form\nTimeField.jsx";
  "components/form\nTimePicker.jsx" -> "components/form\nTimePickerContainer.jsx";
  "components/form\nDateAndTimeField.jsx" -> "dispatch/components/deliveries\nDeliveryDateModal.jsx";
  "dispatch/components/deliveries\nDeliveryDateModal.jsx" -> "dispatch/components/deliveries/actionItems\nDeliveryActionItems.jsx";
  "dispatch/components/deliveries/actionItems\nDeliveryActionItems.jsx" -> "dispatch/components/deliveries\nDeliveryHeader.jsx";
  "dispatch/components/deliveries\nDeliveryHeader.jsx" -> "dispatch/components/deliveries\nDelivery.jsx";
  "components/form\nTimeField.jsx" -> "components/form\nTimeRangeField.jsx";
  "components/form\nTimeRangeField.jsx" -> "dispatch/components/deliveries\nDeliveryDateModal.jsx";
  "components/form\nTimeRangeField.jsx" -> "core/components/shipments/action_items\nDeliveryAppointmentScheduleActionItem.jsx";
  "dispatch/components/deliveries\nDeliveryDateModal.jsx" -> "dispatch/components/deliveries/actionItems\nDeliveryActionItems.jsx";
  "dispatch/components/deliveries/actionItems\nDeliveryActionItems.jsx" -> "dispatch/components/deliveries\nDeliveryHeader.jsx";
  "core/components/shipments/action_items\nDeliveryAppointmentScheduleActionItem.jsx" -> "core/components/shipments/show\nShipmentActionItems.jsx";
  "core/components/shipments/show\nShipmentActionItems.jsx" -> "core/components/shipments/show\nShipmentView.jsx";
}
```
</details>

