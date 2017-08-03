import * as T from "babel-types";
import traverse, {Binding, NodePath} from "babel-traverse";

function generateLibdefs({ types: t }: { types: typeof T }) {
  return {
    visitor: {
      ClassDeclaration(path: NodePath<T.ClassDeclaration>) {
        const ident = path.node.id;
        const {leadingComments} = path.node;
        const name = ident.name;
        const prop = t.objectTypeProperty(
          path.scope.generateUidIdentifier('someProp'),
          t.stringTypeAnnotation()
        );
        const decl = t.declareClass(ident, null, [],
                                    t.objectTypeAnnotation(
          [prop], [], []
        ));

        path.replaceWith(decl);
        if (leadingComments && leadingComments.length) {
          path.addComments('leading', leadingComments);
        }
        path.skip();
      }
    }
  };
}

module.exports = generateLibdefs;
